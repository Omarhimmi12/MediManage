import { jsPDF } from "jspdf";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ── Color palette ──
const TEAL = [13, 148, 136];
const TEAL_LIGHT = [20, 184, 166];
const TEAL_DARK = [9, 108, 100];
const TEAL_TINT = [214, 245, 242];
const DARK = [30, 41, 59];
const GRAY = [100, 116, 139];
const SLATE = [194, 200, 212];
const SLATE_BG = [248, 250, 252];
const GREEN = [34, 197, 94];
const ORANGE = [251, 146, 60];
const RED = [239, 68, 68];
const WHITE = [255, 255, 255];

export default function exportConsultationPDF(data) {
  const doc = new jsPDF("p", "mm", "a4");

  // ── Page background ──
  doc.setFillColor(...SLATE_BG);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // ── Helpers ──
  function drawLogoCircle(cx, cy, r, crossColor, circleFill) {
    doc.setFillColor(...circleFill);
    doc.circle(cx, cy, r, "F");
    const s = r * 0.52;
    const w = r * 0.36;
    doc.setFillColor(...crossColor);
    doc.rect(cx - w / 2, cy - s, w, s * 2, "F");
    doc.rect(cx - s, cy - w / 2, s * 2, w, "F");
  }

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
    if (data?.medecinNom) return data.medecinNom;
    if (data?.medecinPrenom && data?.medecinNom) return `${data.medecinPrenom} ${data.medecinNom}`;
    if (data?.medecin) {
      if (typeof data.medecin === "string") return data.medecin;
      if (data.medecin?.nom && data.medecin?.prenom) return `${data.medecin.prenom} ${data.medecin.nom}`;
      if (data.medecin?.user?.nom && data.medecin?.user?.prenom) return `${data.medecin.user.prenom} ${data.medecin.user.nom}`;
      if (data.medecin?.user?.name) return data.medecin.user.name;
    }
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

  // ═══════════════════════════════════════════
  //  HEADER
  // ═══════════════════════════════════════════
  const HEADER_H = 32;

  doc.setFillColor(...TEAL);
  doc.rect(0, 0, PAGE_W, HEADER_H, "F");

  // Diagonal triangle accent (darker teal, right side)
  doc.setFillColor(...TEAL_DARK);
  doc.triangle(PAGE_W, 0, PAGE_W, HEADER_H, PAGE_W - 65, HEADER_H);

  // Light teal bottom strip
  doc.setFillColor(...TEAL_LIGHT);
  doc.rect(0, HEADER_H - 3, PAGE_W, 3, "F");

  // Left: logo circle with medical cross
  drawLogoCircle(MARGIN + 8, HEADER_H / 2, 7, TEAL, WHITE);

  // Left: brand
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MediManage", MARGIN + 20, HEADER_H / 2 - 2);
  doc.setTextColor(...TEAL_LIGHT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text("Syst\u00e8me de gestion m\u00e9dicale", MARGIN + 20, HEADER_H / 2 + 8);

  // Right: document type
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("FICHE DE CONSULTATION", PAGE_W - MARGIN, HEADER_H / 2 - 2, { align: "right" });
  doc.setTextColor(...TEAL_LIGHT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    `Imprim\u00e9 le ${new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    PAGE_W - MARGIN,
    HEADER_H / 2 + 8,
    { align: "right" }
  );

  // ═══════════════════════════════════════════
  //  PAGE TITLE
  // ═══════════════════════════════════════════
  let y = HEADER_H + 14;

  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Fiche de Consultation", MARGIN, y);

  // Teal underline accent bar
  doc.setFillColor(...TEAL);
  doc.roundedRect(MARGIN, y + 3, 44, 3, 1.5, 1.5, "F");

  y += 22;

  // ═══════════════════════════════════════════
  //  INFO FIELDS  (rounded cards with accent)
  // ═══════════════════════════════════════════
  const colW = CONTENT_W / 2 - 5;
  const cardH = 22;
  const leftX = MARGIN;
  const rightX = MARGIN + CONTENT_W / 2 + 3;
  const rowGap = 8;

  function drawInfoCard(x, yPos, label, value, accentColor) {
    // White card with slate border
    doc.setDrawColor(...SLATE);
    doc.setFillColor(...WHITE);
    doc.roundedRect(x, yPos, colW, cardH, 4, 4, "FD");

    // Pill-shaped accent strip (full height)
    doc.setFillColor(...accentColor);
    doc.roundedRect(x + 1, yPos + 2, 3, cardH - 4, 1.5, 1.5, "F");

    // Label
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(label.toUpperCase(), x + 8, yPos + 8);

    // Value
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(String(value), x + 8, yPos + 17);
  }

  // Row 1
  drawInfoCard(leftX, y, "Patient", getPatient(), TEAL);
  drawInfoCard(rightX, y, "M\u00e9decin", getMedecin(), TEAL_LIGHT);
  y += cardH + rowGap;

  // Row 2
  drawInfoCard(leftX, y, "Cabinet", getCabinet(), TEAL);
  drawInfoCard(rightX, y, "Date", getDate(), TEAL_LIGHT);
  y += cardH + rowGap;

  // Row 3
  const hasOrdonnance = getOrdonnance() !== "—";
  const ordAccent = hasOrdonnance ? GREEN : ORANGE;
  drawInfoCard(leftX, y, "Motif", getMotif(), TEAL);
  drawInfoCard(rightX, y, "Ordonnance", hasOrdonnance ? "Oui" : "Non", ordAccent);
  y += cardH + rowGap + 6;

  // ═══════════════════════════════════════════
  //  SECTION BLOCK  (Diagnostic / Ordonnance)
  // ═══════════════════════════════════════════
  function drawSection(title, bodyContent, bodyH, isEmpty, startY) {
    const secHeaderH = 9;
    const totalH = secHeaderH + 1 + bodyH;

    // Page-break guard
    if (startY + totalH > PAGE_H - 30) {
      doc.addPage();
      doc.setFillColor(...SLATE_BG);
      doc.rect(0, 0, PAGE_W, PAGE_H, "F");
      startY = 20;
    }

    // ── Header bar (solid teal rounded) ──
    doc.setFillColor(...TEAL);
    doc.roundedRect(MARGIN, startY, CONTENT_W, secHeaderH, 4, 4, "F");

    // Two decorative white squares
    doc.setFillColor(...WHITE);
    doc.rect(MARGIN + 10, startY + (secHeaderH - 4) / 2, 4, 4, "F");
    doc.rect(MARGIN + 17, startY + (secHeaderH - 4) / 2, 4, 4, "F");

    // Title
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(title, MARGIN + 26, startY + 6.5);

    // ── Body area ──
    const bodyY = startY + secHeaderH + 1;

    doc.setFillColor(...WHITE);
    doc.roundedRect(MARGIN, bodyY, CONTENT_W, bodyH, 4, 4, "F");

    // Soft teal tint strip on left edge
    doc.setFillColor(...TEAL_TINT);
    doc.roundedRect(MARGIN + 1, bodyY + 2, 3, bodyH - 4, 1.5, 1.5, "F");

    if (isEmpty) {
      doc.setTextColor(...GRAY);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      const placeholder =
        title === "Diagnostic"
          ? "Aucun diagnostic renseign\u00e9"
          : "Aucune ordonnance prescrite";
      doc.text(placeholder, MARGIN + 12, bodyY + bodyH / 2 + 1.5);
    } else {
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const maxW = CONTENT_W - 22;
      const lines = doc.splitTextToSize(bodyContent, maxW);
      doc.text(lines, MARGIN + 12, bodyY + 6);
    }

    return startY + totalH;
  }

  // ── Diagnostic ──
  const diagText = getDiagnostic();
  const hasDiag = diagText !== "—";
  const diagLines = doc.splitTextToSize(diagText, CONTENT_W - 22);
  const diagBodyH = hasDiag ? Math.max(20, diagLines.length * 5 + 10) : 24;
  y = drawSection("Diagnostic", diagText, diagBodyH, !hasDiag, y);

  // ── Ordonnance ──
  const ordText = getOrdonnance();
  const hasOrd = ordText !== "—";
  const ordLines = doc.splitTextToSize(ordText, CONTENT_W - 22);
  const ordBodyH = hasOrd ? Math.max(20, ordLines.length * 5 + 10) : 24;
  y = drawSection("Ordonnance", ordText, ordBodyH, !hasOrd, y);

  // ═══════════════════════════════════════════
  //  PAYMENT SECTION
  // ═══════════════════════════════════════════
  const PAY_H = 34;
  const payHeaderH = 9;

  if (y + payHeaderH + 1 + PAY_H > PAGE_H - 30) {
    doc.addPage();
    doc.setFillColor(...SLATE_BG);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    y = 20;
  }

  // Payment header
  doc.setFillColor(...TEAL);
  doc.roundedRect(MARGIN, y, CONTENT_W, payHeaderH, 4, 4, "F");

  doc.setFillColor(...WHITE);
  doc.rect(MARGIN + 10, y + (payHeaderH - 4) / 2, 4, 4, "F");
  doc.rect(MARGIN + 17, y + (payHeaderH - 4) / 2, 4, 4, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Paiement", MARGIN + 26, y + 6.5);

  const payBodyY = y + payHeaderH + 1;
  doc.setFillColor(...WHITE);
  doc.roundedRect(MARGIN, payBodyY, CONTENT_W, PAY_H, 4, 4, "F");

  // Light slate background inside body for the mini cards
  doc.setFillColor(...SLATE_BG);
  doc.roundedRect(MARGIN + 4, payBodyY + 4, CONTENT_W - 8, PAY_H - 8, 4, 4, "F");

  // Three mini cards: Montant, Mode, Statut
  const miniW = (CONTENT_W - 20) / 3;
  const miniH = 22;
  const miniY = payBodyY + 6;

  function drawMiniCard(cx, label, value, valueColor) {
    const xPos = cx - miniW / 2;
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...SLATE);
    doc.roundedRect(xPos, miniY, miniW, miniH, 4, 4, "FD");

    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(label.toUpperCase(), xPos + miniW / 2, miniY + 8, { align: "center" });

    doc.setTextColor(...valueColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(String(value), xPos + miniW / 2, miniY + 17, { align: "center" });
  }

  const statutValue = getStatutPaiement();
  const statutLower = statutValue.toLowerCase();
  let statutColor = GRAY;
  if (statutLower === "pay\u00e9" || statutLower === "paye") statutColor = GREEN;
  else if (statutLower === "en_attente") statutColor = ORANGE;
  else if (statutLower === "non_pay\u00e9" || statutLower === "non pay\u00e9" || statutLower === "non_paye") statutColor = RED;

  const center1 = MARGIN + CONTENT_W / 2;
  const center0 = MARGIN + (CONTENT_W - 8) / 3;
  const center2 = MARGIN + CONTENT_W - (CONTENT_W - 8) / 3;

  drawMiniCard(center0, "Montant", getMontant(), DARK);
  drawMiniCard(center1, "Mode de paiement", getModePaiement(), DARK);

  // Statut with pill badge
  function drawMiniStatutCard(cx, label, value, pillColor) {
    const xPos = cx - miniW / 2;
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...SLATE);
    doc.roundedRect(xPos, miniY, miniW, miniH, 4, 4, "FD");

    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(label.toUpperCase(), xPos + miniW / 2, miniY + 8, { align: "center" });

    // Pill badge
    const pillW = 22;
    const pillH = 10;
    doc.setFillColor(...pillColor);
    doc.roundedRect(xPos + miniW / 2 - pillW / 2, miniY + 10, pillW, pillH, pillH / 2, pillH / 2, "F");

    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text(String(value), xPos + miniW / 2, miniY + 17, { align: "center" });
  }

  drawMiniStatutCard(center2, "Statut", statutValue, statutColor);

  y = payBodyY + PAY_H + 10;

  // ═══════════════════════════════════════════
  //  FOOTER
  // ═══════════════════════════════════════════
  if (y > PAGE_H - 30) {
    doc.addPage();
    doc.setFillColor(...SLATE_BG);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
    y = 20;
  }

  const FOOTER_Y = PAGE_H - 16;

  doc.setFillColor(...TEAL);
  doc.rect(0, FOOTER_Y, PAGE_W, 16, "F");

  // Darker teal top edge line
  doc.setFillColor(...TEAL_DARK);
  doc.rect(0, FOOTER_Y, PAGE_W, 0.8, "F");

  // Left: mini logo circle + brand
  drawLogoCircle(MARGIN + 4, FOOTER_Y + 8, 4, TEAL, WHITE);

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("MediManage", MARGIN + 11, FOOTER_Y + 6);

  doc.setTextColor(...TEAL_LIGHT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("Syst\u00e8me de gestion m\u00e9dicale", MARGIN + 11, FOOTER_Y + 11);

  // Right: print date
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    `Imprim\u00e9 le ${new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    PAGE_W - MARGIN,
    FOOTER_Y + 7,
    { align: "right" }
  );

  // Five small white decorative dots
  const dots = [0, 1, 2, 3, 4];
  dots.forEach((i) => {
    doc.setFillColor(...WHITE);
    doc.circle(PAGE_W - MARGIN - 4 - i * 4, FOOTER_Y + 11, 0.8, "F");
  });

  // ═══════════════════════════════════════════
  //  SAVE
  // ═══════════════════════════════════════════
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
