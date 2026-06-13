<?php

namespace App\Http\Controllers\Api;

use App\Events\NewMessageEvent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'content' => 'required|string|max:5000',
        ]);

        $user = $request->user();
        $conversation = Conversation::whereParticipant($user->id)->findOrFail($request->conversation_id);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'sender_type' => $user->role,
            'content' => $request->content,
        ]);

        $message->load('sender');
        try {
            broadcast(new NewMessageEvent($message))->toOthers();
        } catch (\Exception $e) {
            // Broadcasting is optional - don't fail if not configured
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_type' => $message->sender_type,
                'sender_name' => $message->sender?->nom . ' ' . ($message->sender?->prenom ?? ''),
                'content' => $message->content,
                'is_read' => $message->is_read,
                'created_at' => $message->created_at,
            ],
        ], 201);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Message::whereHas('conversation.participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('sender_id', '!=', $user->id)
          ->where('is_read', false)
          ->count();

        return response()->json([
            'success' => true,
            'data' => ['count' => $count],
        ]);
    }

    public function notifications(Request $request)
    {
        $user = $request->user();

        $notifications = Message::whereHas('conversation.participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('sender_id', '!=', $user->id)
          ->where('is_read', false)
          ->with(['sender', 'conversation.participants.user'])
          ->latest()
          ->take(20)
          ->get()
          ->map(function ($msg) use ($user) {
              $otherParticipant = $msg->conversation->participants->firstWhere('user_id', '!=', $user->id);
              $sender = $msg->sender;

              return [
                  'id' => $msg->id,
                  'conversation_id' => $msg->conversation_id,
                  'sender_name' => $sender ? trim($sender->nom . ' ' . ($sender->prenom ?? '')) : 'Inconnu',
                  'sender_role' => $msg->sender_type,
                  'preview' => \Illuminate\Support\Str::limit($msg->content, 60),
                  'created_at' => $msg->created_at,
                  'time_ago' => $msg->created_at->diffForHumans(),
              ];
          });

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $message = Message::whereHas('conversation.participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->findOrFail($id);

        $message->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Message marked as read',
        ]);
    }

    public function markConversationAsRead(Request $request, $conversationId)
    {
        $user = $request->user();

        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All messages marked as read',
        ]);
    }
}
