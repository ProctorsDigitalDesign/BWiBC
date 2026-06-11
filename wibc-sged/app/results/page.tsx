"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { getBandDescription, getProcurementAdvice } from "@/lib/scoring";
import { ArrowRight, Download, Award } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 680);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const data = sessionStorage.getItem("sged_result");
    if (!data) {
      router.replace("/");
    } else {
      setResultData(JSON.parse(data));
    }
  }, [router]);

  if (!resultData) {
    return (
      <div className="container" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Loading your results...</p>
      </div>
    );
  }

  const { total_score, maturity_band, scores } = resultData;

  const chartData = [
    { subject: "Flexible Working", score: scores.flexible_working, fullMark: 5 },
    { subject: "Senior Rep.", score: scores.senior_representation, fullMark: 5 },
    { subject: "Networks", score: scores.sponsorship_networks, fullMark: 5 },
    { subject: "Progression", score: scores.frontline_progression, fullMark: 5 },
    { subject: "Recruitment", score: scores.bias_free_recruitment, fullMark: 5 },
    { subject: "Pay Gap", score: scores.intersectional_pay_gap, fullMark: 5 },
    { subject: "Accountability", score: scores.executive_accountability, fullMark: 5 },
  ];

  // Map bands to their respective colors in the design system
  const bandColors: Record<string, { bg: string, text: string }> = {
    'Emerging': { bg: 'rgba(236, 30, 35, 0.1)', text: 'var(--color-action)' },
    'Developing': { bg: 'rgba(246, 145, 29, 0.1)', text: 'var(--color-orange)' },
    'Strategic': { bg: 'rgba(25, 171, 73, 0.1)', text: 'var(--color-green)' },
    'Innovating': { bg: 'rgba(245, 233, 22, 0.2)', text: '#b08d2b' }, // darker yellow for contrast
  };

  const currentBandStyle = bandColors[maturity_band as string] || bandColors['Emerging'];

  return (
    <div className="container">
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
        <h1 style={{ marginBottom: "var(--space-sm)", letterSpacing: "-0.02em" }}>Diagnostic Results</h1>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", maxWidth: "600px", margin: "0 auto" }}>
          Thank you for completing the WiBC Supplier Gender Equity Diagnostic.
        </p>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", 
        gap: "var(--space-xl)",
        marginBottom: "var(--space-xl)"
      }}>
        
        {/* Scorecard */}
        <div className="card" style={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center",
          textAlign: "center",
          padding: "var(--space-3xl) var(--space-xl)"
        }}>
          <div style={{ 
            fontFamily: "var(--font-heading)",
            fontSize: "0.875rem", 
            fontWeight: 700,
            textTransform: "uppercase", 
            letterSpacing: "0.1em", 
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-md)"
          }}>
            Total Score
          </div>
          
          <div style={{ 
            fontSize: "5rem", 
            fontFamily: "var(--font-heading)",
            fontWeight: 800, 
            color: "var(--color-primary)", 
            lineHeight: 1,
            marginBottom: "var(--space-lg)",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "0.5rem"
          }}>
            {total_score} 
            <span style={{ fontSize: "2rem", color: "var(--color-border-light)", fontWeight: 600 }}>/ 35</span>
          </div>

          <div style={{ 
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.5rem 1.25rem", 
            borderRadius: "var(--radius-full)", 
            background: currentBandStyle.bg, 
            color: currentBandStyle.text,
            fontWeight: 700,
            fontSize: "1.125rem",
            marginBottom: "var(--space-lg)"
          }}>
            <Award size={18} />
            {maturity_band}
          </div>

          <p style={{ color: "var(--color-text-muted)", fontSize: "1rem", maxWidth: "300px", lineHeight: 1.5 }}>
            {getBandDescription(maturity_band)}
          </p>
        </div>

        {/* Radar Chart */}
        <div className="card" style={{ display: "flex", flexDirection: "column", paddingTop: "var(--space-xl)" }}>
          <h3 style={{ textAlign: "center", marginBottom: "var(--space-md)", fontSize: "1.25rem" }}>
            Maturity Spider Chart
          </h3>
          <div style={{ flex: 1, minHeight: "300px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "77%" : "65%"} data={chartData}>
                <PolarGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: isMobile ? 9 : 11, fontWeight: 500 }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 5]} 
                  tick={{ fontSize: 10, fill: 'var(--color-text-light)' }} 
                  axisLine={false}
                />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  fill="var(--color-primary)" 
                  fillOpacity={0.3} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Procurement Advice Block */}
      <div style={{ 
        background: "var(--color-primary)", 
        borderRadius: "var(--radius-xl)", 
        padding: "var(--space-2xl)",
        color: "white",
        boxShadow: "var(--shadow-purple)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative background element */}
        <div style={{ 
          position: "absolute", 
          top: "-50%", 
          right: "-10%", 
          width: "400px", 
          height: "400px", 
          borderRadius: "50%", 
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ color: "white", marginBottom: "var(--space-md)", fontSize: "1.5rem" }}>
            Recommended Next Steps
          </h2>
          <p style={{ 
            fontSize: "1.125rem", 
            lineHeight: 1.6, 
            color: "rgba(255, 255, 255, 0.9)",
            maxWidth: "800px",
            marginBottom: "var(--space-2xl)"
          }}>
            {getProcurementAdvice(maturity_band)}
          </p>

          <div style={{ 
            paddingTop: "var(--space-xl)", 
            borderTop: "1px solid rgba(255, 255, 255, 0.15)", 
            display: "flex", 
            flexWrap: "wrap",
            gap: "var(--space-lg)",
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <div style={{ fontSize: "1rem", color: "rgba(255, 255, 255, 0.9)" }}>
              <strong style={{ color: "white" }}>Ready to take the next step?</strong> Join the West of England Women in Business Charter today.
            </div>
            
            <a 
              href="https://www.bristolwomeninbusinesscharter.org/" 
              target="_blank" 
              rel="noreferrer" 
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                background: "white",
                color: "var(--color-primary)",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "0.9375rem",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
