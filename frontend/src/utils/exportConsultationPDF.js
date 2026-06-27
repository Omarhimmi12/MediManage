import { jsPDF } from "jspdf";

// ─────────────────────────────────────────────
//  PAGE CONSTANTS
// ─────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─────────────────────────────────────────────
//  COLOR PALETTE
// ─────────────────────────────────────────────
const TEAL       = [13,  148, 136];
const TEAL_LIGHT = [20,  184, 166];
const TEAL_DARK  = [9,   108, 100];
const TEAL_TINT  = [214, 245, 242];
const TEAL_ULTRA = [240, 253, 250];
const DARK       = [15,  23,  42];
const DARK2      = [30,  41,  59];
const GRAY       = [100, 116, 139];
const GRAY_LIGHT = [148, 163, 184];
const SLATE      = [203, 213, 225];
const SLATE_BG   = [248, 250, 252];
const WHITE      = [255, 255, 255];
const GREEN      = [22,  163, 74];
const GREEN_SOFT = [220, 252, 231];
const ORANGE     = [234, 88,  12];
const ORANGE_SOFT= [255, 237, 213];
const RED        = [220, 38,  38];
const RED_SOFT   = [254, 226, 226];
const GOLD       = [161, 108, 0];
const GOLD_SOFT  = [254, 243, 199];

// ─────────────────────────────────────────────
//  MAIN EXPORT
// ─────────────────────────────────────────────
export default function exportConsultationPDF(data) {
  const doc = new jsPDF("p", "mm", "a4");

  // ── Utility: set full-page slate background ──
  function drawPageBackground() {
    doc.setFillColor(...SLATE_BG);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");

    // Subtle dot-grid watermark feel (very light)
    doc.setDrawColor(210, 218, 228);
    doc.setLineWidth(0.1);
    for (let gx = MARGIN; gx < PAGE_W - MARGIN; gx += 8) {
      for (let gy = 44; gy < PAGE_H - 20; gy += 8) {
        doc.circle(gx, gy, 0.25, "S");
      }
    }
  }

  // ── Utility: medical cross logo ──
  function drawLogoCircle(cx, cy, r, crossColor, fillColor) {
    // Outer glow ring
    doc.setFillColor(255, 255, 255, 0.18);
    doc.circle(cx, cy, r + 1.5, "F");

    // Main circle
    doc.setFillColor(...fillColor);
    doc.circle(cx, cy, r, "F");

    // Inner ring
    doc.setDrawColor(...crossColor);
    doc.setLineWidth(0.3);
    doc.circle(cx, cy, r - 1.2, "S");

    // Cross arms
    const s = r * 0.52;
    const w = r * 0.3;
    doc.setFillColor(...crossColor);
    doc.roundedRect(cx - w / 2, cy - s, w, s * 2, w * 0.3, w * 0.3, "F");
    doc.roundedRect(cx - s, cy - w / 2, s * 2, w, w * 0.3, w * 0.3, "F");
  }

  // ── Utility: draw a section divider line ──
  function sectionDivider(yPos) {
    doc.setDrawColor(...SLATE);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, yPos, PAGE_W - MARGIN, yPos);
  }

  // ── Utility: draw a star / badge stamp ──
  function drawVerifiedStamp(x, y) {
    doc.setFillColor(...TEAL_TINT);
    doc.circle(x, y, 6, "F");
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(0.4);
    doc.circle(x, y, 6, "S");
    doc.setTextColor(...TEAL_DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5);
    doc.text("✓", x, y + 1.8, { align: "center" });
  }

  // ─────────────────────────────────────────
  //  DATA ACCESSORS
  // ─────────────────────────────────────────
  const getPatient = () => {
    if (data.patient) {
      const nom    = data.patient?.nom    ?? "";
      const prenom = data.patient?.prenom ?? "";
      return `${nom} ${prenom}`.trim() || "—";
    }
    return data.patientName || "—";
  };

  const getDate = () => {
    if (data.date)                     return formatDate(data.date);
    if (data.date_consultation)        return formatDate(data.date_consultation);
    if (data.rendez_vous?.date_rdv)    return formatDate(data.rendez_vous.date_rdv);
    return "—";
  };

  const getMotif          = () => data.motif || data.rendez_vous?.motif || "—";
  const getDiagnostic     = () => data.diagnostic || "—";
  const getOrdonnance     = () => data.ordonnance || "—";
  const getNotes          = () => data.notes || data.note || data.commentaire || "";
  const getNextRdv        = () => {
    if (data.prochainRdv)              return formatDate(data.prochainRdv);
    if (data.prochain_rdv)             return formatDate(data.prochain_rdv);
    return "";
  };

  const getMontant = () => {
    const val = data.montant ?? data.tarif;
    return val != null ? `${Number(val).toFixed(2)} DH` : "—";
  };

  const getModePaiement   = () => data.modePaiement   || data.mode_paiement   || "—";
  const getStatutPaiement = () => data.statutPaiement  || data.statut_paiement  || "—";

  const getMedecin = () => {
    if (data?.medecinNom) {
      return data?.medecinPrenom
        ? `Dr. ${data.medecinPrenom} ${data.medecinNom}`
        : `Dr. ${data.medecinNom}`;
    }
    if (data?.medecin) {
      if (typeof data.medecin === "string") return data.medecin;
      const m = data.medecin;
      if (m?.user?.prenom && m?.user?.nom) return `Dr. ${m.user.prenom} ${m.user.nom}`;
      if (m?.prenom && m?.nom)             return `Dr. ${m.prenom} ${m.nom}`;
      if (m?.user?.name)                   return m.user.name;
    }
    if (data?.rendez_vous?.medecin) {
      const m = data.rendez_vous.medecin;
      if (typeof m === "string")             return m;
      if (m?.user?.prenom && m?.user?.nom)   return `Dr. ${m.user.prenom} ${m.user.nom}`;
      if (m?.prenom && m?.nom)               return `Dr. ${m.prenom} ${m.nom}`;
      if (m?.user?.name)                     return m.user.name;
    }
    return "—";
  };

  const getSpecialite = () => {
    if (data?.specialite)                      return data.specialite;
    if (data?.medecin?.specialite)             return data.medecin.specialite;
    if (data?.rendez_vous?.medecin?.specialite)return data.rendez_vous.medecin.specialite;
    return "";
  };

  const getCabinet = () => {
    if (data?.cabinetNom)  return data.cabinetNom;
    if (data?.cabinetName) return data.cabinetName;
    if (data?.cabinet) {
      if (typeof data.cabinet === "string") return data.cabinet;
      return data.cabinet?.nom || data.cabinet?.name || "—";
    }
    if (data?.rendez_vous?.cabinet) {
      const c = data.rendez_vous.cabinet;
      if (typeof c === "string") return c;
      return c?.nom || c?.name || "—";
    }
    return "—";
  };

  const getCabinetAddress = () => {
    if (data?.cabinetAdresse)   return data.cabinetAdresse;
    if (data?.cabinet?.adresse) return data.cabinet.adresse;
    return "";
  };

  const getConsultationId = () => {
    return data?.id || data?.consultation_id || "";
  };

  // ─────────────────────────────────────────
  //  DRAW PAGE BACKGROUND
  // ─────────────────────────────────────────
  drawPageBackground();

  // ═══════════════════════════════════════════════════════
  //  HEADER  – premium gradient-style with side accent
  // ═══════════════════════════════════════════════════════
  const HEADER_H = 38;

  // Main header fill
  doc.setFillColor(...TEAL_DARK);
  doc.rect(0, 0, PAGE_W, HEADER_H, "F");

  // Lighter band across the top 60 %
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, PAGE_W * 0.72, HEADER_H, "F");

  // Diagonal sweep (decorative)
  doc.setFillColor(...TEAL_DARK);
  doc.triangle(PAGE_W * 0.62, 0, PAGE_W * 0.72, 0, PAGE_W * 0.62, HEADER_H);

  // Bright accent strip – bottom edge
  doc.setFillColor(...TEAL_LIGHT);
  doc.rect(0, HEADER_H - 2.5, PAGE_W, 2.5, "F");

  // Ultra-light strip above accent
  doc.setFillColor(255, 255, 255, 0.07);
  doc.rect(0, HEADER_H - 6, PAGE_W, 3.5, "F");

  // Right decorative circles (watermark-style)
  doc.setFillColor(255, 255, 255);
  doc.circle(PAGE_W - 14, -4,  18, "F");   // partially off-page
  doc.setFillColor(...TEAL_DARK);
  doc.circle(PAGE_W - 14, -4,  13, "F");

  // Logo
  drawLogoCircle(MARGIN + 9, HEADER_H / 2 - 1, 8.5, TEAL_DARK, WHITE);

  // Brand name
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("MediManage", MARGIN + 22, HEADER_H / 2 - 2.5);

  doc.setTextColor(...TEAL_LIGHT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Système de gestion médicale", MARGIN + 22, HEADER_H / 2 + 5.5);

  // Vertical separator
  doc.setDrawColor(255, 255, 255, 0.3);
  doc.setLineWidth(0.4);
  doc.line(PAGE_W * 0.52, 6, PAGE_W * 0.52, HEADER_H - 6);

  // Document type (right block)
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("FICHE DE CONSULTATION", PAGE_W - MARGIN, HEADER_H / 2 - 5, { align: "right" });

  doc.setTextColor(...TEAL_LIGHT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    `Imprimé le ${new Date().toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    })}`,
    PAGE_W - MARGIN, HEADER_H / 2 + 2, { align: "right" }
  );

  // Consultation ID badge (if available)
  const cid = getConsultationId();
  if (cid) {
    doc.setFillColor(...TEAL_LIGHT);
    doc.roundedRect(PAGE_W - MARGIN - 38, HEADER_H / 2 + 5, 38, 7, 3.5, 3.5, "F");
    doc.setTextColor(...TEAL_DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text(`Réf : #${cid}`, PAGE_W - MARGIN - 19, HEADER_H / 2 + 9.8, { align: "center" });
  }

  // ═══════════════════════════════════════════════════════
  //  TITLE BANNER (below header)
  // ═══════════════════════════════════════════════════════
  let y = HEADER_H + 10;

  // Title row with line
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Fiche de Consultation", MARGIN, y + 5);

  // Decorative accent bar
  doc.setFillColor(...TEAL);
  doc.roundedRect(MARGIN, y + 8, 50, 2.5, 1.2, 1.2, "F");
  doc.setFillColor(...TEAL_LIGHT);
  doc.roundedRect(MARGIN + 52, y + 8, 14, 2.5, 1.2, 1.2, "F");
  doc.setFillColor(...SLATE);
  doc.roundedRect(MARGIN + 68, y + 8, 6, 2.5, 1.2, 1.2, "F");

  // Right: compact doctor info tag
  if (getMedecin() !== "—") {
    const tagX = PAGE_W - MARGIN - 64;
    doc.setFillColor(...TEAL_ULTRA);
    doc.setDrawColor(...TEAL_LIGHT);
    doc.setLineWidth(0.4);
    doc.roundedRect(tagX, y - 2, 64, 14, 4, 4, "FD");
    drawLogoCircle(tagX + 7, y + 5, 4.5, WHITE, TEAL);
    doc.setTextColor(...TEAL_DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(getMedecin(), tagX + 14, y + 3.5);
    const spec = getSpecialite();
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(spec || getCabinet(), tagX + 14, y + 9);
  }

  y += 18;

  // ═══════════════════════════════════════════════════════
  //  IDENTITY CARDS  (2-column grid)
  // ═══════════════════════════════════════════════════════
  const COL_W   = CONTENT_W / 2 - 4;
  const CARD_H  = 24;
  const LEFT_X  = MARGIN;
  const RIGHT_X = MARGIN + CONTENT_W / 2 + 4;
  const ROW_GAP = 5;

  /**
   * drawInfoCard – premium flat card with accent pill + icon area
   */
  function drawInfoCard(x, yPos, label, value, accentColor, iconChar) {
    // Drop shadow simulation (offset rect)
    doc.setFillColor(200, 210, 220, 0.4);
    doc.roundedRect(x + 0.8, yPos + 0.8, COL_W, CARD_H, 5, 5, "F");

    // Card body
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...SLATE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, yPos, COL_W, CARD_H, 5, 5, "FD");

    // Left accent pill
    doc.setFillColor(...accentColor);
    doc.roundedRect(x + 1.5, yPos + 3, 3, CARD_H - 6, 1.5, 1.5, "F");

    // Top-right icon circle
    if (iconChar) {
      doc.setFillColor(...TEAL_ULTRA);
      doc.circle(x + COL_W - 7, yPos + CARD_H / 2, 4.5, "F");
      doc.setTextColor(...TEAL);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(iconChar, x + COL_W - 7, yPos + CARD_H / 2 + 2.5, { align: "center" });
    }

    // Label
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.text(label.toUpperCase(), x + 8, yPos + 8);

    // Value – truncate if too long
    const maxValW = COL_W - 22;
    const valStr  = String(value);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const valLines = doc.splitTextToSize(valStr, maxValW);
    doc.text(valLines[0] || valStr, x + 8, yPos + 17.5);
  }

  // Row 1 – Patient | Date
  drawInfoCard(LEFT_X,  y, "Patient",  getPatient(), TEAL,       "P");
  drawInfoCard(RIGHT_X, y, "Date",     getDate(),    TEAL_LIGHT, "D");
  y += CARD_H + ROW_GAP;

  // Row 2 – Médecin | Cabinet
  drawInfoCard(LEFT_X,  y, "Médecin", getMedecin(), TEAL,       "M");
  drawInfoCard(RIGHT_X, y, "Cabinet", getCabinet(), TEAL_LIGHT, "C");
  y += CARD_H + ROW_GAP;

  // Row 3 – Motif | Ordonnance badge
  const hasOrd    = getOrdonnance() !== "—";
  const ordAccent = hasOrd ? GREEN : ORANGE;
  drawInfoCard(LEFT_X,  y, "Motif de consultation", getMotif(), TEAL, "!");

  // Ordonnance card (special badge style)
  {
    const x    = RIGHT_X;
    const yPos = y;

    // Shadow
    doc.setFillColor(200, 210, 220, 0.4);
    doc.roundedRect(x + 0.8, yPos + 0.8, COL_W, CARD_H, 5, 5, "F");

    doc.setFillColor(...WHITE);
    doc.setDrawColor(...SLATE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, yPos, COL_W, CARD_H, 5, 5, "FD");

    // Accent pill
    doc.setFillColor(...ordAccent);
    doc.roundedRect(x + 1.5, yPos + 3, 3, CARD_H - 6, 1.5, 1.5, "F");

    // Label
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    doc.text("ORDONNANCE", x + 8, yPos + 8);

    // Pill badge
    const pillW  = 28;
    const pillH  = 10;
    const pillBg = hasOrd ? GREEN_SOFT : ORANGE_SOFT;
    const pillFg = hasOrd ? GREEN      : ORANGE;
    doc.setFillColor(...pillBg);
    doc.roundedRect(x + 8, yPos + 10, pillW, pillH, pillH / 2, pillH / 2, "F");
    doc.setTextColor(...pillFg);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(hasOrd ? "Prescrite" : "Non prescrite", x + 8 + pillW / 2, yPos + 16.5, { align: "center" });
  }

  y += CARD_H + ROW_GAP + 6;

  // ═══════════════════════════════════════════════════════
  //  SECTION BLOCK  helper
  // ═══════════════════════════════════════════════════════
  function drawSection(title, bodyText, isEmpty, startY, options = {}) {
    const { accentColor = TEAL, emptyMsg = "Aucune information renseignée" } = options;

    const HEADER_H_S = 10;
    const paddingTop = 7;
    const paddingBot = 7;
    const lineH      = 5;

    // Pre-calculate body height
    let bodyH;
    if (isEmpty) {
      bodyH = 22;
    } else {
      const lines = doc.splitTextToSize(bodyText, CONTENT_W - 24);
      bodyH = Math.max(20, lines.length * lineH + paddingTop + paddingBot);
    }

    const totalH = HEADER_H_S + 2 + bodyH;

    // Page-break guard
    if (startY + totalH > PAGE_H - 22) {
      doc.addPage();
      drawPageBackground();
      startY = MARGIN;
    }

    // ── Section header ──
    // Shadow
    doc.setFillColor(150, 180, 175, 0.3);
    doc.roundedRect(MARGIN + 0.6, startY + 0.6, CONTENT_W, HEADER_H_S, 5, 5, "F");

    doc.setFillColor(...accentColor);
    doc.roundedRect(MARGIN, startY, CONTENT_W, HEADER_H_S, 5, 5, "F");

    // Lighter right accent
    doc.setFillColor(...TEAL_LIGHT);
    doc.roundedRect(MARGIN + CONTENT_W - 30, startY, 30, HEADER_H_S, 5, 5, "F");
    doc.setFillColor(...accentColor);
    doc.roundedRect(MARGIN + CONTENT_W - 30, startY, 16, HEADER_H_S, 0, 0, "F");

    // Small decorative squares
    doc.setFillColor(...WHITE);
    doc.roundedRect(MARGIN + 7,  startY + 3, 4, 4, 1, 1, "F");
    doc.roundedRect(MARGIN + 14, startY + 3, 4, 4, 1, 1, "F");

    // Title text
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(title, MARGIN + 22, startY + 7);

    // ── Section body ──
    const bodyY = startY + HEADER_H_S + 2;

    // Shadow
    doc.setFillColor(200, 210, 220, 0.4);
    doc.roundedRect(MARGIN + 0.6, bodyY + 0.6, CONTENT_W, bodyH, 5, 5, "F");

    doc.setFillColor(...WHITE);
    doc.setDrawColor(...SLATE);
    doc.setLineWidth(0.25);
    doc.roundedRect(MARGIN, bodyY, CONTENT_W, bodyH, 5, 5, "FD");

    // Left teal tint strip
    doc.setFillColor(...TEAL_TINT);
    doc.roundedRect(MARGIN + 1.5, bodyY + 3, 3.5, bodyH - 6, 1.5, 1.5, "F");

    if (isEmpty) {
      // Empty state
      doc.setFillColor(...SLATE_BG);
      doc.roundedRect(MARGIN + 9, bodyY + 4, CONTENT_W - 18, bodyH - 8, 4, 4, "F");
      doc.setTextColor(...GRAY_LIGHT);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(emptyMsg, MARGIN + CONTENT_W / 2, bodyY + bodyH / 2 + 1.5, { align: "center" });
    } else {
      doc.setTextColor(...DARK2);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const lines = doc.splitTextToSize(bodyText, CONTENT_W - 24);
      doc.text(lines, MARGIN + 9, bodyY + paddingTop);
    }

    return startY + totalH + 6;
  }

  // ── Diagnostic ──
  const diagText = getDiagnostic();
  y = drawSection(
    "Diagnostic",
    diagText,
    diagText === "—",
    y,
    { emptyMsg: "Aucun diagnostic renseigné" }
  );

  // ── Ordonnance ──
  const ordText = getOrdonnance();
  y = drawSection(
    "Ordonnance / Prescription",
    ordText,
    ordText === "—",
    y,
    { emptyMsg: "Aucune ordonnance prescrite" }
  );

  // ── Notes (optional) ──
  const notesText = getNotes();
  if (notesText) {
    y = drawSection(
      "Notes & Observations",
      notesText,
      false,
      y,
      { accentColor: TEAL_DARK }
    );
  }

  // ═══════════════════════════════════════════════════════
  //  PAYMENT  SECTION
  // ═══════════════════════════════════════════════════════
  const PAY_HEADER_H = 10;
  const PAY_BODY_H   = 38;
  const PAY_TOTAL    = PAY_HEADER_H + 2 + PAY_BODY_H;

  if (y + PAY_TOTAL > PAGE_H - 22) {
    doc.addPage();
    drawPageBackground();
    y = MARGIN;
  }

  // Payment header
  doc.setFillColor(150, 180, 175, 0.3);
  doc.roundedRect(MARGIN + 0.6, y + 0.6, CONTENT_W, PAY_HEADER_H, 5, 5, "F");

  doc.setFillColor(...TEAL_DARK);
  doc.roundedRect(MARGIN, y, CONTENT_W, PAY_HEADER_H, 5, 5, "F");

  doc.setFillColor(...TEAL_LIGHT);
  doc.roundedRect(MARGIN + CONTENT_W - 30, y, 30, PAY_HEADER_H, 5, 5, "F");
  doc.setFillColor(...TEAL_DARK);
  doc.roundedRect(MARGIN + CONTENT_W - 30, y, 16, PAY_HEADER_H, 0, 0, "F");

  doc.setFillColor(...WHITE);
  doc.roundedRect(MARGIN + 7,  y + 3, 4, 4, 1, 1, "F");
  doc.roundedRect(MARGIN + 14, y + 3, 4, 4, 1, 1, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Informations de Paiement", MARGIN + 22, y + 7);

  const payBodyY = y + PAY_HEADER_H + 2;

  // Payment body
  doc.setFillColor(200, 210, 220, 0.4);
  doc.roundedRect(MARGIN + 0.6, payBodyY + 0.6, CONTENT_W, PAY_BODY_H, 5, 5, "F");

  doc.setFillColor(...WHITE);
  doc.setDrawColor(...SLATE);
  doc.setLineWidth(0.25);
  doc.roundedRect(MARGIN, payBodyY, CONTENT_W, PAY_BODY_H, 5, 5, "FD");

  // Inner subtle background
  doc.setFillColor(...TEAL_ULTRA);
  doc.roundedRect(MARGIN + 4, payBodyY + 4, CONTENT_W - 8, PAY_BODY_H - 8, 4, 4, "F");

  // ── Three mini-cards ──
  const MINI_W  = (CONTENT_W - 24) / 3;
  const MINI_H  = 28;
  const MINI_Y  = payBodyY + (PAY_BODY_H - MINI_H) / 2;
  const GAP     = 6;
  const START_X = MARGIN + 6;

  function drawPayCard(xPos, label, value, valueColor, pillBg) {
    // Shadow
    doc.setFillColor(200, 210, 220, 0.4);
    doc.roundedRect(xPos + 0.6, MINI_Y + 0.6, MINI_W, MINI_H, 5, 5, "F");

    doc.setFillColor(...WHITE);
    doc.setDrawColor(...SLATE);
    doc.setLineWidth(0.25);
    doc.roundedRect(xPos, MINI_Y, MINI_W, MINI_H, 5, 5, "FD");

    // Top bar
    doc.setFillColor(...TEAL_TINT);
    doc.roundedRect(xPos, MINI_Y, MINI_W, 6, 5, 5, "F");
    doc.setFillColor(...TEAL_TINT);     // fill corners flat
    doc.rect(xPos, MINI_Y + 3, MINI_W, 3, "F");

    // Label
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.8);
    doc.text(label.toUpperCase(), xPos + MINI_W / 2, MINI_Y + 4.5, { align: "center" });

    // Value or pill badge
    if (pillBg) {
      const pW = MINI_W - 10;
      const pH = 9;
      doc.setFillColor(...pillBg);
      doc.roundedRect(xPos + 5, MINI_Y + 15, pW, pH, pH / 2, pH / 2, "F");
      doc.setTextColor(...valueColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(String(value), xPos + MINI_W / 2, MINI_Y + 21, { align: "center" });
    } else {
      doc.setTextColor(...valueColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(String(value), xPos + MINI_W / 2, MINI_Y + 20, { align: "center" });
    }
  }

  // Statut color
  const statutValue = getStatutPaiement();
  const statutLower = statutValue.toLowerCase();
  let pillBgColor = GOLD_SOFT;
  let pillFgColor = GOLD;
  if (statutLower === "payé" || statutLower === "paye") {
    pillBgColor = GREEN_SOFT; pillFgColor = GREEN;
  } else if (["non_payé","non_paye","non payé","non paye"].includes(statutLower)) {
    pillBgColor = RED_SOFT; pillFgColor = RED;
  } else if (statutLower === "en_attente" || statutLower === "en attente") {
    pillBgColor = ORANGE_SOFT; pillFgColor = ORANGE;
  }

  const x0 = START_X;
  const x1 = START_X + MINI_W + GAP;
  const x2 = START_X + (MINI_W + GAP) * 2;

  drawPayCard(x0, "Montant",         getMontant(),      DARK,       null);
  drawPayCard(x1, "Mode de paiement",getModePaiement(), DARK2,      null);
  drawPayCard(x2, "Statut",          statutValue,       pillFgColor, pillBgColor);

  y = payBodyY + PAY_BODY_H + 8;

  // ═══════════════════════════════════════════════════════
  //  NEXT RDV  (optional callout box)
  // ═══════════════════════════════════════════════════════
  const nextRdv = getNextRdv();
  if (nextRdv) {
    if (y + 14 > PAGE_H - 22) {
      doc.addPage();
      drawPageBackground();
      y = MARGIN;
    }

    doc.setFillColor(...TEAL_ULTRA);
    doc.setDrawColor(...TEAL_LIGHT);
    doc.setLineWidth(0.4);
    doc.roundedRect(MARGIN, y, CONTENT_W, 14, 5, 5, "FD");

    doc.setFillColor(...TEAL_LIGHT);
    doc.roundedRect(MARGIN, y, 5, 14, 5, 0, "F");
    doc.setFillColor(...TEAL_LIGHT);
    doc.rect(MARGIN + 2, y, 3, 14, "F");

    doc.setTextColor(...TEAL_DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Prochain rendez-vous :", MARGIN + 9, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(nextRdv, MARGIN + 60, y + 6);

    // Calendar icon hint
    doc.setTextColor(...TEAL);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("→", MARGIN + 55, y + 6);

    y += 20;
  }

  // ═══════════════════════════════════════════════════════
  //  SIGNATURE AREA
  // ═══════════════════════════════════════════════════════
  if (y + 28 < PAGE_H - 22) {
    const SIG_Y = y;
    const halfW = CONTENT_W / 2 - 8;

    // Patient signature
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...SLATE);
    doc.setLineWidth(0.25);
    doc.roundedRect(MARGIN, SIG_Y, halfW, 24, 4, 4, "FD");
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text("SIGNATURE PATIENT", MARGIN + halfW / 2, SIG_Y + 6, { align: "center" });
    doc.setDrawColor(...SLATE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN + 8, SIG_Y + 20, MARGIN + halfW - 8, SIG_Y + 20);

    // Doctor signature
    const sigRight = MARGIN + CONTENT_W - halfW;
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...SLATE);
    doc.roundedRect(sigRight, SIG_Y, halfW, 24, 4, 4, "FD");
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text("CACHET & SIGNATURE MÉDECIN", sigRight + halfW / 2, SIG_Y + 6, { align: "center" });
    doc.setDrawColor(...SLATE);
    doc.line(sigRight + 8, SIG_Y + 20, sigRight + halfW - 8, SIG_Y + 20);

    // Verified stamp on doctor side
    drawVerifiedStamp(sigRight + halfW - 10, SIG_Y + 12);

    y = SIG_Y + 30;
  }

  // ═══════════════════════════════════════════════════════
  //  FOOTER
  // ═══════════════════════════════════════════════════════
  const FOOTER_Y = PAGE_H - 18;

  // Footer background
  doc.setFillColor(...TEAL_DARK);
  doc.rect(0, FOOTER_Y, PAGE_W, 18, "F");

  // Teal top edge
  doc.setFillColor(...TEAL_LIGHT);
  doc.rect(0, FOOTER_Y, PAGE_W, 2, "F");

  // Lighter section right side
  doc.setFillColor(...TEAL);
  doc.rect(PAGE_W * 0.55, FOOTER_Y + 2, PAGE_W * 0.45, 16, "F");

  // Triangle accent
  doc.setFillColor(...TEAL_DARK);
  doc.triangle(PAGE_W * 0.55, FOOTER_Y + 2, PAGE_W * 0.55 + 20, FOOTER_Y + 2, PAGE_W * 0.55, FOOTER_Y + 18);

  // Left: logo + brand
  drawLogoCircle(MARGIN + 5, FOOTER_Y + 9, 4.5, TEAL_DARK, WHITE);

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("MediManage", MARGIN + 13, FOOTER_Y + 7.5);

  doc.setTextColor(...TEAL_LIGHT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text("Système de gestion médicale", MARGIN + 13, FOOTER_Y + 12.5);

  // Center: confidentiality note
  doc.setTextColor(...TEAL_LIGHT);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.5);
  doc.text(
    "Document confidentiel – Usage médical exclusif",
    PAGE_W / 2, FOOTER_Y + 10,
    { align: "center" }
  );

  // Right: print date
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    `Imprimé le ${new Date().toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    })}`,
    PAGE_W - MARGIN, FOOTER_Y + 7.5,
    { align: "right" }
  );

  // Decorative dot row
  for (let i = 0; i < 5; i++) {
    doc.setFillColor(...WHITE);
    doc.circle(PAGE_W - MARGIN - 3 - i * 5, FOOTER_Y + 13, 0.9, "F");
  }

  // ═══════════════════════════════════════════════════════
  //  SAVE
  // ═══════════════════════════════════════════════════════
  const safeName = String(getPatient())
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase()
    .slice(0, 30) || "patient";

  doc.save(`consultation_${safeName}.pdf`);
}

// ─────────────────────────────────────────────
//  DATE FORMATTER
// ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}