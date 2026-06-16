"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from "recharts";
import { GOALS } from "@/lib/goals";
import {
  getBandDescription, getProcurementAdvice,
  getGoalMaturityLabel, getGoalPriorityLevel,
} from "@/lib/scoring";
import {
  DownloadSimple,
  Printer,
  Trophy,
  Warning,
  CheckCircle,
  Clock,
  Crown,
  ShieldCheck,
  Ladder,
  Scales,
  Binoculars,
  Graph,
  ArrowRight,
  Star,
  Buildings,
  ChartLineUp,
  Users,
  Confetti,
  ArrowUp,
  SortAscending,
  CaretDown,
  Lightbulb,
  Target,
} from "@phosphor-icons/react";

/* ── Types ──────────────────────────────────────────────────────────────── */
interface ResultData {
  total_score: number;
  maturity_band: string;
  scores: Record<string, number>;
}
interface ProfileData {
  company_name?: string;
  contact_name?: string;
  industry_sector?: string;
  logo_preview?: string;
  workforce_female?: string;
  workforce_male?: string;
  workforce_non_binary?: string;
  quartile_lower_female?: string;
  quartile_lower_male?: string;
  quartile_lower_middle_female?: string;
  quartile_lower_middle_male?: string;
  quartile_upper_middle_female?: string;
  quartile_upper_middle_male?: string;
  quartile_upper_female?: string;
  quartile_upper_male?: string;
}

/* ── Design constants (match globals.css tokens) ─────────────────────── */
const R = {
  sm: "6px",
  md: "10px",
  lg: "16px",
  xl: "24px",
  full: "9999px",
};

const GOAL_ICONS: Record<string, React.ElementType> = {
  flexible_working:         Clock,
  senior_representation:    Crown,
  executive_accountability: ShieldCheck,
  frontline_progression:    Ladder,
  intersectional_pay_gap:   Scales,
  bias_free_recruitment:    Binoculars,
  sponsorship_networks:     Graph,
};

const BAND_CONFIG: Record<string, { bg: string; color: string; border: string }> = {
  Emerging:   { bg: "#fff1f1", color: "#b91c1c", border: "#fecaca" },
  Developing: { bg: "#fff8ee", color: "#c45000", border: "#fed7aa" },
  Strategic:  { bg: "#fffcf0", color: "#92620a", border: "#fde68a" },
  Innovating: { bg: "#f0faf5", color: "#166534", border: "#bbf7d0" },
};

const PRIORITY_CONFIG = {
  high:   { label: "High Priority", color: "#b91c1c", bg: "#fff1f1", border: "#fecaca", Icon: Warning },
  medium: { label: "In Progress",   color: "#c45000", bg: "#fff8ee", border: "#fed7aa", Icon: ChartLineUp },
  strong: { label: "Strong",        color: "#166534", bg: "#f0faf5", border: "#bbf7d0", Icon: CheckCircle },
};

/* ── Sub-components ──────────────────────────────────────────────────── */
function ScoreBar({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div style={{ display: "flex", gap: "3px", flex: 1 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          height: "7px", flex: 1,
          borderRadius: "2px",
          background: i < score ? "#FFBB2B" : "rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

/* Pill badge */
function Pill({ children, bg, color, border }: { children: React.ReactNode; bg: string; color: string; border: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      padding: "0.28rem 0.875rem",
      borderRadius: R.full,
      background: bg, color, border: `1px solid ${border}`,
      fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

/* Icon container */
function IconBox({ Icon, size = 20 }: { Icon: React.ElementType; size?: number }) {
  return (
    <div style={{
      width: "40px", height: "40px",
      borderRadius: R.md,
      background: "linear-gradient(135deg, rgba(255, 187, 43, 0.25) 0%, rgba(255, 187, 43, 0.1) 100%)",
      border: "1px solid rgba(255, 187, 43, 0.3)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={size} weight="duotone" color="#b07a00" />
    </div>
  );
}

/* Section header with serif title */
function SectionHead({ Icon, title, sub }: { Icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", marginBottom: "1.75rem" }}>
      <IconBox Icon={Icon} />
      <div>
        <h2 style={{
          fontFamily: "var(--font-heading), 'DM Serif Text', Georgia, serif",
          fontSize: "1.625rem", fontWeight: 400,
          color: "#000", margin: 0, lineHeight: 1.2,
        }}>{title}</h2>
        {sub && <p style={{ margin: "0.3rem 0 0", fontSize: "0.875rem", color: "var(--color-text-muted)", fontFamily: "Aptos, system-ui, sans-serif" }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function ResultsPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [profile, setProfile] = useState<ProfileData>({});
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const narrow = isTablet; // Keep alias for legacy padding calculations
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [openGoalAccordion, setOpenGoalAccordion] = useState<string | null>(null);

  useEffect(() => {
    const onResize = () => {
      setIsTablet(window.innerWidth < 1024);
      setIsMobile(window.innerWidth < 640);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("sged_result");
    const prof = sessionStorage.getItem("sged_profile");
    if (!raw) { router.replace("/"); return; }
    setResultData(JSON.parse(raw));
    if (prof) setProfile(JSON.parse(prof));
  }, [router]);

  const downloadPdf = async () => {
    if (!reportRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    // Wait for state updates and Framer Motion animations to complete for all accordions
    await new Promise(r => setTimeout(r, 400));
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#f7f7f5", 
        logging: false 
      });
      
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ 
        orientation: "portrait", 
        unit: "px", 
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      pdf.addImage(img, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`WiBC-GED-${(profile.company_name ?? "Results").replace(/\s+/g, "-")}.pdf`);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsGeneratingPdf(false); 
    }
  };

  if (!resultData) return (
    <div className="container" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--color-text-muted)" }}>Loading your results…</p>
    </div>
  );

  const { total_score, maturity_band, scores } = resultData;
  const band = BAND_CONFIG[maturity_band] ?? BAND_CONFIG.Emerging;
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const goalsWithScores = GOALS.map(g => ({ goal: g, score: scores[g.id] ?? 0 }));
  const byScore = [...goalsWithScores].sort((a, b) => b.score - a.score);
  const strongest = byScore[0];
  const weakest = byScore[byScore.length - 1];
  const priorityOrder = [...goalsWithScores].sort((a, b) => a.score - b.score);

  // Demographics
  const f = parseFloat(profile.workforce_female ?? "0") || 0;
  const m = parseFloat(profile.workforce_male ?? "0") || 0;
  const nb = parseFloat(profile.workforce_non_binary ?? "0") || 0;
  const hasDemo = f > 0 || m > 0;
  const dt = f + m + nb || 100;
  const fP = Math.round((f / dt) * 100);
  const mP = Math.round((m / dt) * 100);
  const nbP = Math.round((nb / dt) * 100);

  const quartiles = [
    { label: "Lower (0–25%)",    f: parseFloat(profile.quartile_lower_female ?? "0") || 0,        m: parseFloat(profile.quartile_lower_male ?? "0") || 0 },
    { label: "Lower Middle",     f: parseFloat(profile.quartile_lower_middle_female ?? "0") || 0,  m: parseFloat(profile.quartile_lower_middle_male ?? "0") || 0 },
    { label: "Upper Middle",     f: parseFloat(profile.quartile_upper_middle_female ?? "0") || 0,  m: parseFloat(profile.quartile_upper_middle_male ?? "0") || 0 },
    { label: "Upper (75–100%)", f: parseFloat(profile.quartile_upper_female ?? "0") || 0,        m: parseFloat(profile.quartile_upper_male ?? "0") || 0 },
  ];
  const hasQuartiles = quartiles.some(q => q.f > 0 || q.m > 0);

  const radarData = [
    { subject: "Flexible Working", score: scores.flexible_working ?? 0, fullMark: 5 },
    { subject: "Senior Rep.",      score: scores.senior_representation ?? 0, fullMark: 5 },
    { subject: "Networks",         score: scores.sponsorship_networks ?? 0, fullMark: 5 },
    { subject: "Progression",      score: scores.frontline_progression ?? 0, fullMark: 5 },
    { subject: "Recruitment",      score: scores.bias_free_recruitment ?? 0, fullMark: 5 },
    { subject: "Pay Gap",          score: scores.intersectional_pay_gap ?? 0, fullMark: 5 },
    { subject: "Accountability",   score: scores.executive_accountability ?? 0, fullMark: 5 },
  ];

  /* shared card style */
  const card: React.CSSProperties = {
    background: "#fff",
    borderRadius: R.lg,
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
    padding: "2rem",
    transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
  };

  const bodyFont = "Aptos, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const headFont = "var(--font-heading), 'DM Serif Text', Georgia, serif";

  return (
    <div ref={reportRef} style={{ background: "var(--color-bg)", minHeight: "100vh" }}>

      {/* ── Hero / Report Header ───────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--color-border)", padding: narrow ? "1.5rem 0 1.75rem" : "2rem 0 2.25rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: narrow ? "0 1rem" : "0 1.5rem" }}>

          {/* Top: org identity + action buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {profile.logo_preview ? (
                <img src={profile.logo_preview} alt="Logo" style={{ height: "52px", width: "auto", objectFit: "contain", borderRadius: R.sm }} />
              ) : (
                <div style={{ width: "52px", height: "52px", borderRadius: R.md, background: "#FFEDB8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Buildings size={26} weight="duotone" color="#b07a00" />
                </div>
              )}
              <div>
                <h1 style={{ fontFamily: headFont, fontSize: narrow ? "1.5rem" : "2rem", fontWeight: 400, color: "#000", margin: "0 0 0.2rem", lineHeight: 1.15 }}>
                  {profile.company_name ?? "Your Organisation"}
                </h1>
                <p style={{ fontFamily: bodyFont, margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Gender Equity Diagnostic · {today}{profile.industry_sector ? ` · ${profile.industry_sector}` : ""}
                </p>
              </div>
            </div>

            <div data-html2canvas-ignore="true" style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={downloadPdf}
                disabled={isGeneratingPdf}
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.6rem 1.25rem", borderRadius: R.sm,
                  border: "none", background: "#FFBB2B",
                  fontFamily: bodyFont, fontSize: "0.875rem", fontWeight: 700,
                  cursor: isGeneratingPdf ? "wait" : "pointer", color: "#000",
                  boxShadow: "0 2px 8px rgba(255,187,43,0.35)",
                  opacity: isGeneratingPdf ? 0.7 : 1,
                  transition: "opacity 0.15s, transform 0.15s",
                }}
                onMouseEnter={e => { if (!isGeneratingPdf) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
              >
                <DownloadSimple size={16} weight="bold" />
                {isGeneratingPdf ? "Generating…" : "Download PDF"}
              </button>
            </div>
          </div>

          {/* Score summary banner */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : (isTablet ? "1fr 1fr" : "200px 1fr 1fr 1fr"),
            alignItems: "stretch",
            gap: "0",
            background: "var(--color-surface-2)",
            borderRadius: R.lg,
            border: "1px solid var(--color-border)",
            overflow: "hidden",
          }}>
            {/* Overall score block */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", background: "#FFEDB8", borderRight: isMobile ? "none" : "1px solid var(--color-border)", borderBottom: isTablet ? "1px solid var(--color-border)" : "none" }}>
              <p style={{ fontFamily: bodyFont, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#92620a", margin: "0 0 0.5rem" }}>Your Overall Score</p>
              <div style={{ fontFamily: headFont, fontSize: "3.25rem", fontWeight: 400, color: "#000", lineHeight: 1, display: "flex", alignItems: "baseline", gap: "2px" }}>
                {total_score}<span style={{ fontFamily: bodyFont, fontSize: "1.1rem", color: "var(--color-text-muted)", fontWeight: 400 }}>/35</span>
              </div>
              {/* Mini bar */}
              <div style={{ display: "flex", gap: "2px", marginTop: "0.75rem", width: "80px" }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} style={{ height: "5px", flex: 1, borderRadius: "2px", background: i < Math.floor(total_score / 5) ? "#b07a00" : "rgba(0,0,0,0.12)" }} />
                ))}
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <Pill bg={band.bg} color={band.color} border={band.border}>
                  <Trophy size={12} weight="fill" /> {maturity_band}
                </Pill>
              </div>
            </div>

            {/* Strongest */}
            <div style={{ padding: "1.25rem 1.5rem", borderRight: isTablet ? "none" : "1px solid var(--color-border)", borderBottom: isTablet ? "1px solid var(--color-border)" : "none", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontFamily: bodyFont, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", margin: "0 0 0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <CheckCircle size={12} weight="fill" color="#166534" /> Your Greatest Strength
              </p>
              <p style={{ fontFamily: headFont, fontWeight: 400, fontSize: "1.05rem", color: "#000", lineHeight: 1.3, minHeight: "2.73rem", margin: "0 0 0.75rem" }}>{strongest.goal.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ScoreBar score={strongest.score} />
                <span style={{ fontFamily: bodyFont, fontWeight: 700, color: "#166534", fontSize: "0.875rem", whiteSpace: "nowrap" }}>{strongest.score}/5</span>
              </div>
            </div>

            {/* Priority focus */}
            <div style={{ padding: "1.25rem 1.5rem", borderRight: isMobile ? "none" : "1px solid var(--color-border)", borderBottom: isMobile ? "1px solid var(--color-border)" : "none", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontFamily: bodyFont, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", margin: "0 0 0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Warning size={12} weight="fill" color="#b91c1c" /> Biggest Opportunity to Improve
              </p>
              <p style={{ fontFamily: headFont, fontWeight: 400, fontSize: "1.05rem", color: "#000", lineHeight: 1.3, minHeight: "2.73rem", margin: "0 0 0.75rem" }}>{weakest.goal.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ScoreBar score={weakest.score} />
                <span style={{ fontFamily: bodyFont, fontWeight: 700, color: "#b91c1c", fontSize: "0.875rem", whiteSpace: "nowrap" }}>{weakest.score}/5</span>
              </div>
            </div>

            {/* Band description */}
            <div style={{ padding: "1.25rem 1.5rem", gridColumn: "auto", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontFamily: bodyFont, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", margin: "0 0 0.5rem" }}>What Your Score Tells Us</p>
              <p style={{ fontFamily: bodyFont, fontSize: "0.875rem", color: "var(--color-text)", lineHeight: 1.7, margin: 0 }}>
                {getBandDescription(maturity_band as any)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page body ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: narrow ? "1.5rem 1rem" : "2rem 1.5rem" }}>

        {/* ── Radar + Quick Scores ───────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
          <div style={card}>
            <SectionHead Icon={ChartLineUp} title="Health Check Radar" sub="A visual snapshot of your strengths and areas for growth" />
            <ResponsiveContainer width="100%" height={narrow ? 260 : 340}>
              <RadarChart cx="50%" cy="50%" outerRadius={narrow ? "65%" : "75%"} data={radarData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f6911d" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#FFBB2B" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="rgba(0,0,0,0.06)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: "#444440", fontSize: narrow ? 9.5 : 11, fontFamily: bodyFont, fontWeight: 600 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} tickCount={6} />
                <Tooltip
                  cursor={{ stroke: "rgba(0,0,0,0.05)", strokeWidth: 2 }}
                  contentStyle={{ borderRadius: "8px", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontFamily: bodyFont, fontSize: "0.85rem", padding: "8px 12px" }}
                  itemStyle={{ color: "#c45000", fontWeight: 700 }}
                  labelStyle={{ color: "#444440", fontWeight: 600, marginBottom: "4px" }}
                  formatter={(value: any) => [`${value} / 5`, "Score"]}
                />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="#f6911d" 
                  strokeWidth={2.5} 
                  fill="url(#scoreGradient)"
                  activeDot={{ r: 5, fill: "#fff", stroke: "#f6911d", strokeWidth: 2 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div style={card}>
            <SectionHead Icon={Star} title="Quick Breakdown" sub="See how your business tracks against each specific goal" />
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {GOALS.map((g, idx) => {
                const currentIcon = ["/step-image.png", "/step2-icon.png", "/step3-icon.png"][idx % 3];
                const s = scores[g.id] ?? 0;
                const pl = getGoalPriorityLevel(s);
                const pc = PRIORITY_CONFIG[pl];
                return (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <img src={currentIcon} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: "0.825rem", color: "#000", margin: "0 0 0.325rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.title}</p>
                      <ScoreBar score={s} />
                    </div>
                    <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: "0.875rem", color: pc.color, minWidth: "28px", textAlign: "right" }}>{s}/5</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Per-goal breakdown ──────────────────────────────────────── */}
        <div style={{ ...card, marginBottom: "1.25rem" }}>
          <SectionHead Icon={Buildings} title="Your Roadmap to Improvement" sub="Clear, practical steps to advance each area of your business" />

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {GOALS.map((goal, idx) => {
              const currentIcon = ["/step-image.png", "/step2-icon.png", "/step3-icon.png"][idx % 3];
              const score = scores[goal.id] ?? 0;
              const level = goal.levels.find(l => l.value === score);
              const nextLevel = goal.levels.find(l => l.value === score + 1);
              const pl = getGoalPriorityLevel(score);
              const pc = PRIORITY_CONFIG[pl];
              const PIcon = pc.Icon;
              const hasNext = !!nextLevel;
              const isOpenGoal = isGeneratingPdf || openGoalAccordion === goal.id;

              return (
                <div key={goal.id} style={{ borderRadius: R.md, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden", background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                  {/* Goal header */}
                  <button
                    onClick={() => setOpenGoalAccordion(isOpenGoal ? null : goal.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "0.875rem", padding: "1rem 1.25rem",
                      background: isOpenGoal ? "rgba(0,0,0,0.015)" : "#fff", 
                      borderWidth: isOpenGoal ? "0 0 1px 0" : 0,
                      borderStyle: "solid", borderColor: "rgba(0,0,0,0.06)",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                      textAlign: "left", fontFamily: "inherit", flexWrap: "wrap"
                    }}
                    onMouseEnter={e => { if (!isOpenGoal) e.currentTarget.style.background = "rgba(0,0,0,0.02)"; }}
                    onMouseLeave={e => { if (!isOpenGoal) e.currentTarget.style.background = "#fff"; }}
                  >
                    <div style={{ width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <img src={currentIcon} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                      <p style={{ fontFamily: bodyFont, fontSize: "0.7rem", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.25rem" }}>Goal {idx + 1}</p>
                      <h3 style={{ fontFamily: headFont, fontSize: "1.15rem", fontWeight: 400, color: "#000", margin: 0, lineHeight: 1.25 }}>{goal.title}</h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "120px" }}>
                        <ScoreBar score={score} />
                        <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: "0.875rem", color: "#000" }}>{score}/5</span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpenGoal ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      style={{ flexShrink: 0, display: "flex", alignItems: "center", marginLeft: "0.5rem" }}
                    >
                      <CaretDown size={18} weight="bold" color="var(--color-text-muted)" />
                    </motion.div>
                  </button>

                  {/* Expandable accordion content */}
                  <AnimatePresence initial={false}>
                    {isOpenGoal && (
                      <motion.div
                        initial={isGeneratingPdf ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: isGeneratingPdf ? 0 : 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{ overflow: "hidden" }}
                      >
                        {/* Goal body — two columns on wide, stacked on narrow */}
                        <div style={{ display: "grid", gridTemplateColumns: !narrow && (hasNext || score === 5) ? "1fr 1fr" : "1fr", background: "linear-gradient(180deg, rgba(0,0,0,0.012) 0%, rgba(0,0,0,0) 100%)", padding: narrow ? "1.25rem" : "1.75rem", gap: "1.5rem" }}>
                          {/* Current level */}
                          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: R.md, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                            <p style={{
                              fontFamily: bodyFont, fontSize: "0.7rem", fontWeight: 700,
                              textTransform: "uppercase", letterSpacing: "0.08em",
                              color: "#f6911d", margin: "0 0 0.75rem",
                              display: "flex", alignItems: "center", gap: "0.35rem",
                            }}>
                              <CheckCircle size={13} weight="fill" color="#f6911d" />
                              Where you are now
                            </p>
                            <p style={{ fontFamily: bodyFont, fontSize: "0.9rem", color: "var(--color-text)", lineHeight: 1.75, margin: 0 }}>
                              {level?.text ?? "We don't have enough data to score this yet. Let's make it a starting point!"}
                            </p>
                          </div>

                          {/* Next step or sector leader */}
                          {hasNext ? (
                            <div style={{ background: "#fffcf5", padding: "1.5rem", borderRadius: R.md, border: "1px solid rgba(196, 80, 0, 0.1)", boxShadow: "0 2px 10px rgba(196, 80, 0, 0.03)" }}>
                              <p style={{
                                fontFamily: bodyFont, fontSize: "0.7rem", fontWeight: 700,
                                textTransform: "uppercase", letterSpacing: "0.08em",
                                color: "#c45000", margin: "0 0 0.75rem",
                              }}>
                                Suggestions to improve
                              </p>
                              {nextLevel!.guide ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                  {nextLevel!.guide.split('\n').map((line, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                                      <span style={{ color: "#c45000", fontSize: "1.1rem", lineHeight: 1 }}>•</span>
                                      <span style={{ fontFamily: bodyFont, fontSize: "0.9rem", color: "var(--color-text)", lineHeight: 1.6, margin: 0 }}>{line.replace(/^•\s*/, '')}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p style={{ fontFamily: bodyFont, fontSize: "0.9rem", color: "var(--color-text)", lineHeight: 1.75, margin: 0 }}>{nextLevel!.text}</p>
                              )}
                            </div>
                          ) : score === 5 ? (
                            <div style={{ background: "#f0faf5", padding: "1.5rem", borderRadius: R.md, border: "1px solid rgba(22, 101, 52, 0.1)", boxShadow: "0 2px 10px rgba(22, 101, 52, 0.03)", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                              <Confetti size={32} weight="duotone" color="#166534" style={{ flexShrink: 0, marginTop: "2px" }} />
                              <div>
                                <p style={{ fontFamily: headFont, fontWeight: 400, fontSize: "1.1rem", color: "#166534", margin: "0 0 0.375rem" }}>Industry Leader</p>
                                <p style={{ fontFamily: bodyFont, fontSize: "0.9rem", color: "var(--color-text)", lineHeight: 1.7, margin: 0 }}>
                                  You’re setting the standard here! Consider sharing your success story with the WiBC community to inspire others.
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Priority Action Matrix ──────────────────────────────────── */}
        <div style={{ ...card, marginBottom: "1.25rem", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: narrow ? "1.5rem 1.25rem" : "2rem" }}>
            <SectionHead Icon={SortAscending} title="Where to Focus First" sub="Start with these high-impact areas to get the best results quickly" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {priorityOrder.map(({ goal, score }, rank) => {
              const goalIndex = GOALS.findIndex(g => g.id === goal.id);
              const currentIcon = ["/step-image.png", "/step2-icon.png", "/step3-icon.png"][goalIndex % 3];
              const pl = getGoalPriorityLevel(score);
              const pc = PRIORITY_CONFIG[pl];
              const PIcon = pc.Icon;
              const isOpen = isGeneratingPdf || openAccordion === goal.id;
              const level = goal.levels.find(l => l.value === score);
              const nextLevel = goal.levels.find(l => l.value === score + 1);

              return (
                <div key={goal.id} style={{ borderTop: rank === 0 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                  {/* Clickable row header */}
                  <button
                    onClick={() => setOpenAccordion(isOpen ? null : goal.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: narrow ? "0.625rem" : "0.875rem",
                      padding: narrow ? "1rem 1.25rem" : "1.125rem 2rem",
                      width: "100%",
                      background: isOpen ? "rgba(0,0,0,0.015)" : "transparent",
                      borderWidth: "0 0 1px 0",
                      borderStyle: "solid", borderColor: "rgba(0,0,0,0.06)",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "rgba(0,0,0,0.02)"; }}
                    onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontFamily: headFont, fontSize: "1.15rem", fontWeight: 400, color: pc.color, minWidth: "28px", flexShrink: 0 }}>#{rank + 1}</span>
                    <div style={{
                      width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <img src={currentIcon} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: "120px" }}>
                      <p style={{ fontFamily: bodyFont, fontWeight: 600, color: "#000", fontSize: "0.9rem", margin: "0 0 0.1rem" }}>{goal.title}</p>
                      <p style={{ fontFamily: bodyFont, fontSize: "0.75rem", color: "var(--color-text-muted)", margin: 0 }}>{getGoalMaturityLabel(score)}</p>
                    </div>
                    {!isMobile && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
                        <div style={{ width: "90px" }}><ScoreBar score={score} /></div>
                        <span style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: "0.875rem", color: pc.color }}>{score}/5</span>
                      </div>
                    )}

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      style={{ flexShrink: 0, display: "flex", alignItems: "center" }}
                    >
                      <CaretDown size={18} weight="bold" color="var(--color-text-muted)" />
                    </motion.div>
                  </button>

                  {/* Expandable accordion content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{ overflow: "hidden", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        <div style={{
                          padding: narrow ? "1.25rem" : "1.5rem 2rem 1.75rem",
                          background: "linear-gradient(180deg, rgba(0,0,0,0.012) 0%, rgba(0,0,0,0) 100%)",
                          display: "grid",
                          gridTemplateColumns: !narrow && nextLevel ? "1fr 1fr" : "1fr",
                          gap: narrow ? "1.25rem" : "1.5rem",
                        }}>
                          {/* Where you are */}
                          <div style={{
                            background: "#fff",
                            borderRadius: R.md,
                            border: "1px solid rgba(0,0,0,0.06)",
                            padding: "1.25rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                              <div style={{
                                width: "28px", height: "28px", borderRadius: R.sm,
                                background: "linear-gradient(135deg, rgba(246,145,29,0.15) 0%, rgba(246,145,29,0.05) 100%)",
                                border: "1px solid rgba(246,145,29,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <Target size={14} weight="duotone" color="#f6911d" />
                              </div>
                              <p style={{
                                fontFamily: bodyFont, fontSize: "0.7rem", fontWeight: 700,
                                textTransform: "uppercase", letterSpacing: "0.08em",
                                color: "#f6911d", margin: 0,
                              }}>
                                Where you are now
                              </p>
                            </div>
                            <p style={{ fontFamily: bodyFont, fontSize: "0.875rem", color: "var(--color-text)", lineHeight: 1.7, margin: 0 }}>
                              {level?.text ?? "We don't have enough data to score this yet. Let's make it a starting point!"}
                            </p>
                          </div>

                          {/* Next step */}
                          {nextLevel ? (
                            <div style={{
                              background: "linear-gradient(135deg, #FFFCF5 0%, #FFF8EB 100%)",
                              borderRadius: R.md,
                              border: "1px solid rgba(255,187,43,0.2)",
                              padding: "1.25rem",
                              boxShadow: "0 2px 8px rgba(255,187,43,0.06)",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                                <div style={{
                                  width: "28px", height: "28px", borderRadius: R.sm,
                                  background: "linear-gradient(135deg, rgba(255,187,43,0.25) 0%, rgba(255,187,43,0.1) 100%)",
                                  border: "1px solid rgba(255,187,43,0.3)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  <Lightbulb size={14} weight="duotone" color="#b07a00" />
                                </div>
                                <p style={{
                                  fontFamily: bodyFont, fontSize: "0.7rem", fontWeight: 700,
                                  textTransform: "uppercase", letterSpacing: "0.08em",
                                  color: "#b07a00", margin: 0,
                                }}>
                                  Suggestions to improve
                                </p>
                              </div>
                              {nextLevel.guide ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                  {nextLevel.guide.split('\n').map((line, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                                      <span style={{ color: "#b07a00", fontSize: "1.1rem", lineHeight: 1 }}>•</span>
                                      <span style={{ fontFamily: bodyFont, fontSize: "0.875rem", color: "var(--color-text)", lineHeight: 1.6, margin: 0 }}>{line.replace(/^•\s*/, '')}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p style={{ fontFamily: bodyFont, fontSize: "0.875rem", color: "var(--color-text)", lineHeight: 1.7, margin: 0 }}>
                                  {nextLevel.text}
                                </p>
                              )}
                            </div>
                          ) : score === 5 ? (
                            <div style={{
                              background: "linear-gradient(135deg, #F0FAF5 0%, #E8F5EF 100%)",
                              borderRadius: R.md,
                              border: "1px solid rgba(22,101,52,0.15)",
                              padding: "1.25rem",
                              display: "flex", alignItems: "flex-start", gap: "0.75rem",
                            }}>
                              <Confetti size={26} weight="duotone" color="#166534" style={{ flexShrink: 0, marginTop: "2px" }} />
                              <div>
                                <p style={{ fontFamily: headFont, fontWeight: 400, fontSize: "0.95rem", color: "#166534", margin: "0 0 0.35rem" }}>Industry Leader</p>
                                <p style={{ fontFamily: bodyFont, fontSize: "0.875rem", color: "var(--color-text)", lineHeight: 1.65, margin: 0 }}>
                                  You’re setting the standard here! Consider sharing your success story with the WiBC community to inspire others.
                                </p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Demographics ────────────────────────────────────────────── */}
        {hasDemo && (
          <div style={{ ...card, marginBottom: "1.25rem" }}>
            <SectionHead Icon={Users} title="Your Team Makeup" sub="A snapshot of the gender balance data you provided" />
            <div style={{ marginBottom: hasQuartiles ? "1.75rem" : 0 }}>
              <p style={{ fontFamily: bodyFont, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                Company-Wide Gender Balance
              </p>
              <div style={{ display: "flex", height: "28px", borderRadius: R.sm, overflow: "hidden", gap: "2px" }}>
                {fP > 0 && <div style={{ flex: fP, background: "#FFBB2B", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: bodyFont, fontSize: "0.72rem", fontWeight: 700, color: "#000" }}>{fP > 10 ? `${fP}% F` : ""}</span></div>}
                {mP > 0 && <div style={{ flex: mP, background: "#f6911d", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: bodyFont, fontSize: "0.72rem", fontWeight: 700, color: "#fff" }}>{mP > 10 ? `${mP}% M` : ""}</span></div>}
                {nbP > 0 && <div style={{ flex: nbP, background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: bodyFont, fontSize: "0.72rem", fontWeight: 700, color: "#fff" }}>{nbP > 10 ? `${nbP}%` : ""}</span></div>}
              </div>
              <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.625rem", flexWrap: "wrap" }}>
                {fP > 0 && <span style={{ fontFamily: bodyFont, fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-text)" }}><span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#FFBB2B", display: "inline-block" }} /> Female {fP}%</span>}
                {mP > 0 && <span style={{ fontFamily: bodyFont, fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-text)" }}><span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#f6911d", display: "inline-block" }} /> Male {mP}%</span>}
                {nbP > 0 && <span style={{ fontFamily: bodyFont, fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-text)" }}><span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--color-primary)", display: "inline-block" }} /> Non-Binary {nbP}%</span>}
              </div>
            </div>

            {hasQuartiles && (
              <div>
                <p style={{ fontFamily: bodyFont, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--color-text-muted)", marginBottom: "0.875rem" }}>
                  Gender Balance Across Pay Levels
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {quartiles.map(q => {
                    const qt = q.f + q.m || 100;
                    const qF = Math.round((q.f / qt) * 100);
                    const qM = Math.round((q.m / qt) * 100);
                    return (
                      <div key={q.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                          <p style={{ fontFamily: bodyFont, fontSize: "0.825rem", color: "var(--color-text)", fontWeight: 500, margin: 0 }}>{q.label}</p>
                          <p style={{ fontFamily: bodyFont, fontSize: "0.775rem", color: "var(--color-text-muted)", margin: 0 }}>{q.f}% F · {q.m}% M</p>
                        </div>
                        <div style={{ display: "flex", height: "12px", borderRadius: R.sm, overflow: "hidden", gap: "2px" }}>
                          <div style={{ flex: qF, background: "#FFBB2B", borderRadius: `${R.sm} 0 0 ${R.sm}` }} />
                          <div style={{ flex: qM, background: "#f6911d", borderRadius: `0 ${R.sm} ${R.sm} 0` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Next Steps CTA ──────────────────────────────────────────── */}
        <div 
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(245,166,35,0.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 24px rgba(0,0,0,0.06)"; }}
          style={{
          ...card,
          background: "linear-gradient(135deg, #FFFAF0 0%, #FFF4E0 100%)",
          border: "1px solid rgba(255, 187, 43, 0.2)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 24px rgba(0,0,0,0.06)",
          padding: narrow ? "1.75rem 1.25rem" : "2.5rem",
          marginBottom: "1.25rem",
        }}>
          <SectionHead Icon={Trophy} title="Your Action Plan" />
          <p style={{ fontFamily: bodyFont, fontSize: "1rem", lineHeight: 1.75, color: "var(--color-text)", maxWidth: "780px", marginBottom: "1rem" }}>
            {getProcurementAdvice(maturity_band as any)}
          </p>
          
          {total_score < 30 && (
            <p style={{ fontFamily: bodyFont, fontSize: "1rem", lineHeight: 1.75, color: "var(--color-text)", maxWidth: "780px", marginBottom: "1.75rem" }}>
              To boost your score, check out the <strong>Where to Focus First</strong> and <strong>Roadmap</strong> sections above. They break down exactly what your business can do next to build a more inclusive, high-performing workplace.
            </p>
          )}

          <div style={{ borderTop: "1px solid rgba(255, 187, 43, 0.2)", paddingTop: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", alignItems: "center", marginTop: total_score >= 30 ? "1.75rem" : 0 }}>
            <p style={{ fontFamily: bodyFont, fontSize: "0.95rem", color: "var(--color-text)", margin: 0, maxWidth: "540px", lineHeight: 1.5 }}>
              <strong>Ready to take the next step?</strong> Join the Bristol Women in Business Charter and access structured support, peer-learning, and sector recognition.
            </p>
            <a
              href="https://www.bristolwomeninbusinesscharter.org/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ textDecoration: "none", display: "inline-block" }}
            >
              Visit WiBC
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "1rem 0 2.5rem", color: "var(--color-text-light)", fontFamily: bodyFont, fontSize: "0.8rem" }}>
          <p>Bristol Women in Business Charter · Gender Equity Diagnostic · {today}</p>
          {profile.contact_name && <p style={{ marginTop: "0.2rem" }}>Submitted by {profile.contact_name}</p>}
          
          <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.06)", display: "inline-block", paddingLeft: "2rem", paddingRight: "2rem" }}>
            Powered by{" "}
            <a
              href="https://www.proctorsgroup.com/"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#000",
                textDecoration: "none",
                fontWeight: 600,
                transition: "opacity 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Proctor + Stevenson
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
