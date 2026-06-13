<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\User;
use App\Models\Medecin;
use App\Models\Secretaire;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $search = $request->query('search');

        $conversations = Conversation::whereParticipant($user->id)
            ->with([
                'participants.user',
                'lastMessage.sender',
            ])
            ->withCount([
                'messages as unread_count' => function ($q) use ($user) {
                    $q->where('is_read', false)
                      ->where('sender_id', '!=', $user->id);
                },
            ])
            ->orderByDesc(
                Message::select('created_at')
                    ->whereColumn('conversation_id', 'conversations.id')
                    ->latest()
                    ->take(1)
            );

        if ($search) {
            $conversations->whereHas('participants.user', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%");
            });
        }

        $conversations = $conversations->get();

        $data = $conversations->map(function ($conv) use ($user) {
            $otherParticipant = $conv->participants->firstWhere('user_id', '!=', $user->id);
            $otherUser = $otherParticipant?->user;

            return [
                'id' => $conv->id,
                'other_user' => $otherUser ? [
                    'id' => $otherUser->id,
                    'nom' => $otherUser->nom,
                    'prenom' => $otherUser->prenom,
                    'role' => $otherUser->role,
                    'user_type' => $otherParticipant->user_type,
                ] : null,
                'last_message' => $conv->lastMessage ? [
                    'id' => $conv->lastMessage->id,
                    'content' => $conv->lastMessage->content,
                    'created_at' => $conv->lastMessage->created_at,
                    'is_read' => $conv->lastMessage->is_read,
                    'sender_id' => $conv->lastMessage->sender_id,
                ] : null,
                'unread_count' => (int) $conv->unread_count,
                'created_at' => $conv->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $conversation = Conversation::whereParticipant($user->id)
            ->with(['participants.user', 'messages.sender'])
            ->findOrFail($id);

        // Mark all messages as read
        Message::where('conversation_id', $id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'sender_id' => $msg->sender_id,
                    'sender_type' => $msg->sender_type,
                    'sender_name' => $msg->sender?->nom . ' ' . ($msg->sender?->prenom ?? ''),
                    'content' => $msg->content,
                    'is_read' => $msg->is_read,
                    'created_at' => $msg->created_at,
                ];
            });

        $otherParticipant = $conversation->participants->firstWhere('user_id', '!=', $user->id);
        $otherUser = $otherParticipant?->user;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $conversation->id,
                'other_user' => $otherUser ? [
                    'id' => $otherUser->id,
                    'nom' => $otherUser->nom,
                    'prenom' => $otherUser->prenom,
                    'role' => $otherUser->role,
                    'user_type' => $otherParticipant->user_type,
                ] : null,
                'messages' => $messages,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'participant_id' => 'required|exists:users,id',
            'participant_type' => 'required|in:medecin,secretaire,patient',
            'message' => 'required|string|max:5000',
        ]);

        $user = $request->user();

        // Check if conversation already exists between these two users
        $existingConversation = Conversation::whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->whereHas('participants', function ($q) use ($request) {
            $q->where('user_id', $request->participant_id);
        })->first();

        DB::beginTransaction();
        try {
            if ($existingConversation) {
                $conversation = $existingConversation;
            } else {
                $conversation = Conversation::create();

                ConversationParticipant::create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $user->id,
                    'user_type' => $user->role,
                ]);

                ConversationParticipant::create([
                    'conversation_id' => $conversation->id,
                    'user_id' => $request->participant_id,
                    'user_type' => $request->participant_type,
                ]);
            }

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'sender_type' => $user->role,
                'content' => $request->message,
            ]);

            $message->load('sender');

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'conversation_id' => $conversation->id,
                    'message' => [
                        'id' => $message->id,
                        'sender_id' => $message->sender_id,
                        'sender_type' => $message->sender_type,
                        'sender_name' => $message->sender?->nom . ' ' . ($message->sender?->prenom ?? ''),
                        'content' => $message->content,
                        'is_read' => $message->is_read,
                        'created_at' => $message->created_at,
                    ],
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create conversation'], 500);
        }
    }

    public function seed(Request $request)
    {
        $user = $request->user();
        $created = 0;

        DB::beginTransaction();
        try {
            $cabinetId = null;
            $medecinUserId = null;
            $relatedUsers = [];

            if ($user->role === 'medecin') {
                $medecin = Medecin::where('user_id', $user->id)->first();
                if ($medecin) {
                    $cabinet = $medecin->cabinet;
                    if ($cabinet) {
                        $cabinetId = $cabinet->id;
                    }
                }

                // Add secretaires from the same cabinet
                if ($cabinetId) {
                    $secretaires = Secretaire::where('cabinet_id', $cabinetId)->with('user')->get();
                    foreach ($secretaires as $secretaire) {
                        if ($secretaire->user_id !== $user->id) {
                            $relatedUsers[] = ['user_id' => $secretaire->user_id, 'user_type' => 'secretaire'];
                        }
                    }

                    // Add patients from the same cabinet
                    $patients = Patient::where('cabinet_id', $cabinetId)->with('user')->get();
                    foreach ($patients as $patient) {
                        if ($patient->user_id !== $user->id) {
                            $relatedUsers[] = ['user_id' => $patient->user_id, 'user_type' => 'patient'];
                        }
                    }
                }

            } elseif ($user->role === 'secretaire') {
                $secretaire = Secretaire::where('user_id', $user->id)->first();
                if ($secretaire) {
                    $cabinetId = $secretaire->cabinet_id;

                    // Add the medecin from the same cabinet
                    $cabinet = $secretaire->cabinet;
                    if ($cabinet && $cabinet->medecin) {
                        $medecinUserId = $cabinet->medecin->user_id;
                        if ($medecinUserId !== $user->id) {
                            $relatedUsers[] = ['user_id' => $medecinUserId, 'user_type' => 'medecin'];
                        }
                    }

                    // Add patients from the same cabinet
                    $patients = Patient::where('cabinet_id', $cabinetId)->with('user')->get();
                    foreach ($patients as $patient) {
                        if ($patient->user_id !== $user->id) {
                            $relatedUsers[] = ['user_id' => $patient->user_id, 'user_type' => 'patient'];
                        }
                    }
                }

            } elseif ($user->role === 'patient') {
                $patient = Patient::where('user_id', $user->id)->first();
                if ($patient) {
                    $cabinetId = $patient->cabinet_id;

                    // Add the medecin whose cabinet the patient belongs to
                    $cabinet = $patient->cabinet;
                    if ($cabinet && $cabinet->medecin) {
                        $medecinUserId = $cabinet->medecin->user_id;
                        if ($medecinUserId !== $user->id) {
                            $relatedUsers[] = ['user_id' => $medecinUserId, 'user_type' => 'medecin'];
                        }
                    }

                    // Add secretaires from the same cabinet
                    if ($cabinetId) {
                        $secretaires = Secretaire::where('cabinet_id', $cabinetId)->with('user')->get();
                        foreach ($secretaires as $secretaire) {
                            if ($secretaire->user_id !== $user->id) {
                                $relatedUsers[] = ['user_id' => $secretaire->user_id, 'user_type' => 'secretaire'];
                            }
                        }
                    }
                }
            }

            // Also add any users the current user has had rendez-vous with
            if ($user->role === 'patient') {
                $rendezVous = \App\Models\RendezVous::where('patient_id', $patient?->id)
                    ->with('medecin.user')
                    ->get();
                foreach ($rendezVous as $rdv) {
                    if ($rdv->medecin && $rdv->medecin->user_id !== $user->id) {
                        $alreadyExists = false;
                        foreach ($relatedUsers as $ru) {
                            if ($ru['user_id'] === $rdv->medecin->user_id) {
                                $alreadyExists = true;
                                break;
                            }
                        }
                        if (!$alreadyExists) {
                            $relatedUsers[] = ['user_id' => $rdv->medecin->user_id, 'user_type' => 'medecin'];
                        }
                    }
                }
            }

            // Create conversations for each related user
            foreach ($relatedUsers as $ru) {
                if ($ru['user_id'] === $user->id) continue;

                $exists = Conversation::whereHas('participants', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->whereHas('participants', function ($q) use ($ru) {
                    $q->where('user_id', $ru['user_id']);
                })->exists();

                if (!$exists) {
                    $conversation = Conversation::create();
                    ConversationParticipant::create([
                        'conversation_id' => $conversation->id,
                        'user_id' => $user->id,
                        'user_type' => $user->role,
                    ]);
                    ConversationParticipant::create([
                        'conversation_id' => $conversation->id,
                        'user_id' => $ru['user_id'],
                        'user_type' => $ru['user_type'],
                    ]);
                    $created++;
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'created' => $created,
                    'total_contacts' => count($relatedUsers),
                ],
                'message' => "$created nouvelles conversations créées",
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to seed conversations: ' . $e->getMessage()], 500);
        }
    }
}
