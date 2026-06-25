import { jsPDF } from "jspdf";

const lightBg = [248, 250, 252]; // #f8fafc

export default function exportConsultationPDF(data) {
  const doc = new jsPDF("p", "mm", "a4");

  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;

  // ── Colors ──
  const teal = [13, 148, 136];    // #0d9488
  const dark = [30, 41, 59];      // #1e293b
  const gray = [100, 116, 139];   // #64748b

  const getPatient = () => {
    if (data.patient) {
      const nom = data.patient?.nom ?? "";
      const prenom = data.patient?.prenom ?? "";
      return `${nom} ${prenom}`.trim() || "—";
    }
    return data.patientName || "—";
  };

  const getDate = () => {
    if (data.date) return formatDate(data.date);
    if (data.date_consultation) return formatDate(data.date_consultation);
    if (data.rendez_vous?.date_rdv) return formatDate(data.rendez_vous.date_rdv);
    return "—";
  };

  const getMotif = () => data.motif || data.rendez_vous?.motif || "—";
  const getDiagnostic = () => data.diagnostic || "—";
  const getOrdonnance = () => data.ordonnance || "—";
  const getMontant = () => {
    const val = data.montant ?? data.tarif;
    return val ? `${Number(val).toFixed(2)} DH` : "—";
  };
  const getModePaiement = () => data.modePaiement || data.mode_paiement || "—";
  const getStatutPaiement = () => data.statutPaiement || data.statut_paiement || "—";

  const getMedecin = () => {
    // Direct fields (patient dashboard shape)
    if (data?.medecinNom) return data.medecinNom;
    if (data?.medecinPrenom && data?.medecinNom) return `${data.medecinPrenom} ${data.medecinNom}`;

    // Nested medecin object (from rdv -> consultation mapping)
    if (data?.medecin) {
      if (typeof data.medecin === "string") return data.medecin;
      if (data.medecin?.nom && data.medecin?.prenom) return `${data.medecin.prenom} ${data.medecin.nom}`;
      if (data.medecin?.user?.nom && data.medecin?.user?.prenom) {
        return `${data.medecin.user.prenom} ${data.medecin.user.nom}`;
      }
      if (data.medecin?.user?.name) return data.medecin.user.name;
    }

    // rendez_vous nested source
    if (data?.rendez_vous?.medecin) {
      const m = data.rendez_vous.medecin;
      if (typeof m === "string") return m;
      if (m?.user?.nom && m?.user?.prenom) return `${m.user.prenom} ${m.user.nom}`;
      if (m?.nom && m?.prenom) return `${m.prenom} ${m.nom}`;
      if (m?.user?.name) return m.user.name;
    }

    return "—";
  };

  const getCabinet = () => {
    if (data?.cabinetNom) return data.cabinetNom;
    if (data?.cabinetName) return data.cabinetName;

    if (data?.cabinet) {
      if (typeof data.cabinet === "string") return data.cabinet;
      if (data.cabinet?.nom) return data.cabinet.nom;
      if (data.cabinet?.name) return data.cabinet.name;
    }

    if (data?.rendez_vous?.cabinet) {
      const c = data.rendez_vous.cabinet;
      if (typeof c === "string") return c;
      if (c?.nom) return c.nom;
      if (c?.name) return c.name;
    }

    return "—";
  };

  // ── Header bar ──
  doc.setFillColor(...teal);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("MediManage", margin, 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Fiche de Consultation", pageW - margin, 18, { align: "right" });

  // ── Title ──
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleY = 44;
  doc.text("Fiche de Consultation", margin, titleY);

  // ── Info grid ──
  const leftColX = margin;
  const rightColX = margin + contentW / 2 + 8;
  let y = titleY + 18;

  const field = (label, value, x, yPos, colW = contentW / 2 - 4) => {
    doc.setFillColor(...lightBg);
    doc.roundedRect(x, yPos - 5, colW, 18, 2, 2, "F");

    doc.setTextColor(...gray);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(label.toUpperCase(), x + 4, yPos + 0);

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(String(value), x + 4, yPos + 11);
  };

  field("Patient", getPatient(), leftColX, y);
  field("Médecin", getMedecin(), rightColX, y);
  y += 22;

  field("Cabinet", getCabinet(), leftColX, y);
  field("Date", getDate(), rightColX, y);
  y += 22;

  field("Motif", getMotif(), leftColX, y);
  field("Ordonnance", getOrdonnance() !== "—" ? "Oui" : "Non", rightColX, y);

  // ── Diagnostic box ──
  y += 32;
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentW, 3, 1, 1, "F");
  y += 4;

  doc.setFillColor(...teal);
  doc.rect(margin, y - 12, 4, 28, "F");

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Diagnostic", margin + 14, y + 2);

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const diagnosticLines = doc.splitTextToSize(getDiagnostic(), contentW - 28);
  doc.text(diagnosticLines, margin + 14, y + 16);
  y += Math.max(24 + diagnosticLines.length * 5, 36);

  // ── Ordonnance box ──
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentW, 3, 1, 1, "F");
  y += 4;

  doc.setFillColor(...teal);
  doc.rect(margin, y - 12, 4, 28, "F");

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Ordonnance", margin + 14, y + 2);

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const ordonnanceText = getOrdonnance();
  if (ordonnanceText && ordonnanceText !== "—") {
    const ordonnanceLines = doc.splitTextToSize(ordonnanceText, contentW - 28);
    doc.text(ordonnanceLines, margin + 14, y + 16);
    y += Math.max(24 + ordonnanceLines.length * 5, 36);
  } else {
    doc.setTextColor(...gray);
    doc.setFont("helvetica", "italic");
    doc.text("Aucune ordonnance prescrite", margin + 14, y + 16);
    y += 30;
  }

  // ── Paiement section ──
  y += 8;
  doc.setFillColor(...lightBg);
  doc.roundedRect(margin, y, contentW, 2, 1, 1, "F");
  y += 6;

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Paiement", margin, y + 4);
  y += 14;

  const paiementLeft = [
    { label: "Montant", value: getMontant() },
    { label: "Mode de paiement", value: getModePaiement() },
  ];
  const paiementRight = [
    { label: "Statut", value: getStatutPaiement() },
  ];

  paiementLeft.forEach((f) => field(f.label, f.value, leftColX, y));
  paiementRight.forEach((f) => field(f.label, f.value, rightColX, y));
  y += 24;

  // ── Footer ──
  if (y > 270) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(...gray);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);

  doc.setTextColor(...gray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "Document généré par MediManage — Système de gestion médicale",
    margin,
    y + 8
  );
  doc.text(
    `Date d'impression : ${new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    pageW - margin,
    y + 8,
    { align: "right" }
  );

  // ── Save ──
  const safeName = String(getPatient() || "patient")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase()
    .slice(0, 30);
  doc.save(`consultation_${safeName}.pdf`);
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}
