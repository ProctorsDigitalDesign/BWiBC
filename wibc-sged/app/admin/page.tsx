"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Sector
} from "recharts";
import { 
  Download, Search, Shield, Building2, Eye, LogOut, 
  CheckCircle, Mail, User, Calendar, ChevronLeft, ChevronRight, 
  Filter, Users, X, ArrowUpRight, BarChart3, ChevronUp, ChevronDown, Activity
} from "lucide-react";

const goalLabelMap: Record<string, string> = {
  flexible_working: "Flexible Working",
  senior_representation: "Senior Rep.",
  executive_accountability: "Accountability",
  frontline_progression: "Progression",
  intersectional_pay_gap: "Pay Gap",
  bias_free_recruitment: "Recruitment",
  sponsorship_networks: "Networks"
};

const fullGoalLabelMap: Record<string, string> = {
  flexible_working: "Flexible & Part-Time Working",
  senior_representation: "Representative Senior Leadership",
  executive_accountability: "Executive Accountability & Safe Culture",
  frontline_progression: "Progression from Lower-Paid Roles",
  intersectional_pay_gap: "Closing the Intersectional Pay Gap",
  bias_free_recruitment: "Bias-Free Recruitment & Appraisals",
  sponsorship_networks: "Mentoring, Sponsorship & Networks"
};

const bandColors: Record<string, { bg: string, text: string, border: string, chart: string }> = {
  'Emerging':   { bg: '#fff1f1', text: '#b91c1c', border: '#fecaca', chart: '#ef4444' },
  'Developing': { bg: '#fff8ee', text: '#c45000', border: '#fed7aa', chart: '#f97316' },
  'Strategic':  { bg: '#fffcf0', text: '#92620a', border: '#fde68a', chart: '#eab308' },
  'Innovating': { bg: '#f0faf5', text: '#166534', border: '#bbf7d0', chart: '#22c55e' },
};

function ScoreBar({ score, max = 5 }: { score: number; max?: number }) {
  return (
    <div style={{ display: "flex", gap: "4px", flex: 1, height: "8px" }}>
      {Array.from({ length: max }).map((_, i) => (
        <motion.div 
          key={i} 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          style={{
            flex: 1,
            borderRadius: "4px",
            background: i < score ? "var(--color-primary)" : "var(--color-border)",
            transformOrigin: "left"
          }} 
        />
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Table States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBand, setFilterBand] = useState<string>("All");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: "score", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selection States
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    const savedSecret = sessionStorage.getItem("wibc_admin_secret");
    if (savedSecret) {
      setSecret(savedSecret);
      authenticate(savedSecret);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBand]);

  const authenticate = async (secretKey: string) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/suppliers", {
        headers: { "x-admin-secret": secretKey },
      });

      if (!res.ok) throw new Error("Invalid admin secret");

      const data = await res.json();
      setSuppliers(data.suppliers || []);
      setIsAuthenticated(true);
      sessionStorage.setItem("wibc_admin_secret", secretKey);
    } catch (err: any) {
      setError(err.message);
      sessionStorage.removeItem("wibc_admin_secret");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    authenticate(secret);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("wibc_admin_secret");
    setSecret("");
    setSuppliers([]);
    setIsAuthenticated(false);
    setSelectedSupplierId(null);
    setSelectedAssessmentId(null);
  };

  const handleDownloadCSV = async () => {
    try {
      const res = await fetch("/api/admin/export", {
        headers: { "x-admin-secret": secret },
      });
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wibc-sged-assessments-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert("Failed to download CSV");
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // ─── Data Processing ──────────────────────────────────────────────────
  
  let filteredSuppliers = suppliers.filter((s) =>
    s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filterBand !== "All") {
    filteredSuppliers = filteredSuppliers.filter(s => {
      const latest = s.sged_assessments?.[0];
      return latest && latest.maturity_band === filterBand;
    });
  }

  if (sortConfig !== null) {
    filteredSuppliers.sort((a, b) => {
      const aLatest = a.sged_assessments?.[0];
      const bLatest = b.sged_assessments?.[0];
      
      let aVal: any = "";
      let bVal: any = "";

      if (sortConfig.key === "company") {
        aVal = a.company_name.toLowerCase();
        bVal = b.company_name.toLowerCase();
      } else if (sortConfig.key === "score") {
        aVal = aLatest ? aLatest.total_score : -1;
        bVal = bLatest ? bLatest.total_score : -1;
      } else if (sortConfig.key === "band") {
        const weights: any = { "Emerging": 1, "Developing": 2, "Strategic": 3, "Innovating": 4 };
        aVal = aLatest ? (weights[aLatest.maturity_band] || 0) : -1;
        bVal = bLatest ? (weights[bLatest.maturity_band] || 0) : -1;
      } else if (sortConfig.key === "size") {
         aVal = a.company_size || "";
         bVal = b.company_size || "";
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalAssessments = suppliers.reduce((acc, s) => acc + (s.sged_assessments ? s.sged_assessments.length : 0), 0);
  const allScores = suppliers.flatMap(s => (s.sged_assessments || []).map((a: any) => a.total_score));
  const avgScore = allScores.length > 0 ? (allScores.reduce((sum, val) => sum + val, 0) / allScores.length).toFixed(1) : "—";

  // Chart Data
  const radarData = useMemo(() => {
    const scores = {
      flexible_working: 0, senior_representation: 0, executive_accountability: 0,
      frontline_progression: 0, intersectional_pay_gap: 0, bias_free_recruitment: 0, sponsorship_networks: 0
    };
    let count = 0;
    suppliers.forEach(s => {
      const latest = s.sged_assessments?.[0];
      if (latest) {
        count++;
        Object.keys(scores).forEach(key => { scores[key as keyof typeof scores] += latest[key] || 0; });
      }
    });
    if (count === 0) return [];
    return Object.keys(scores).map(key => ({
      subject: goalLabelMap[key] || key,
      A: Number((scores[key as keyof typeof scores] / count).toFixed(1)),
      fullMark: 5,
    }));
  }, [suppliers]);

  const pieData = useMemo(() => {
    const counts: Record<string, number> = { Emerging: 0, Developing: 0, Strategic: 0, Innovating: 0 };
    suppliers.forEach(s => {
      const latest = s.sged_assessments?.[0];
      if (latest && counts[latest.maturity_band] !== undefined) counts[latest.maturity_band]++;
    });
    return Object.entries(counts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [suppliers]);

  // Selected supplier logic
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const assessments = selectedSupplier?.sged_assessments || [];
  
  useEffect(() => {
    if (assessments.length > 0) {
      const hasAssessment = assessments.some((a: any) => a.id === selectedAssessmentId);
      if (!hasAssessment) setSelectedAssessmentId(assessments[0].id);
    } else setSelectedAssessmentId(null);
  }, [selectedSupplierId, assessments]);

  const activeAssessment = assessments.find((a: any) => a.id === selectedAssessmentId);

  // ─── Render Login ─────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "calc(100vh - 73px)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", padding: "1rem" }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="card" 
          style={{ maxWidth: "450px", width: "100%", padding: "3rem 2.5rem", textAlign: "center", borderTop: "4px solid var(--color-primary)", boxShadow: "var(--shadow-xl)", transform: "translateY(-15%)" }}
        >
          <div style={{ display: "inline-flex", padding: "1.25rem", borderRadius: "50%", background: "var(--color-primary-alpha)", color: "var(--color-primary)", marginBottom: "1.5rem" }}>
            <Shield size={40} strokeWidth={1.5} />
          </div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", marginBottom: "0.5rem" }}>Admin Portal</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", marginBottom: "2.5rem" }}>
            Enter your secure access key to manage diagnostic data and track supplier performance.
          </p>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: "left" }}>
              <input
                type="password"
                className="form-input"
                placeholder="Secret Key"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
                style={{ padding: "1rem", fontSize: "1rem", textAlign: "center", letterSpacing: secret.length > 0 ? "0.3em" : "normal", borderRadius: "var(--radius-md)", background: "var(--color-surface-2)" }}
              />
            </div>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="error-banner" style={{ marginBottom: "1.5rem", justifyContent: "center", borderRadius: "var(--radius-sm)" }}>
                <span>{error}</span>
              </motion.div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "1rem", fontSize: "1.05rem", borderRadius: "var(--radius-md)" }} disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Secure Access"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ─── Render Dashboard ─────────────────────────────────────────────────

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) return <ChevronUp size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div style={{ minHeight: "calc(100vh - 73px)", background: "var(--color-surface-2)", position: "relative" }}>
      
      {/* Top Navigation Bar */}
      <div style={{ background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--color-border-light)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem var(--space-lg)", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "1.25rem", fontFamily: "var(--font-heading)", margin: 0 }}>
            <div style={{ background: "var(--color-primary)", width: "32px", height: "32px", borderRadius: "8px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Activity size={18} />
            </div>
            WiBC Analytics Console
          </h1>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleDownloadCSV} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", borderRadius: "var(--radius-sm)" }}>
              <Download size={16} /> Export Data
            </button>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", color: "var(--color-error)", borderColor: "var(--color-error)", borderRadius: "var(--radius-sm)" }}>
              <LogOut size={16} /> Exit
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "2rem var(--space-lg)", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Top KPIs & Charts Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "7fr 13fr", gap: "2rem", marginBottom: "2rem" }}>
          
          {/* Left Column: KPI Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: "#fff", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ background: "var(--color-primary-alpha)", width: "48px", height: "48px", borderRadius: "12px", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Building2 size={24} /></div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Companies</span>
                </div>
                <div style={{ fontSize: "3rem", fontWeight: 400, fontFamily: "var(--font-heading)", lineHeight: 1, textAlign: "left" }}>{suppliers.length}</div>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: "#fff", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{ background: "#fff8ee", width: "48px", height: "48px", borderRadius: "12px", color: "#f6911d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CheckCircle size={24} /></div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assessments</span>
                </div>
                <div style={{ fontSize: "3rem", fontWeight: 400, fontFamily: "var(--font-heading)", lineHeight: 1, textAlign: "left" }}>{totalAssessments}</div>
              </motion.div>
            </div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))", padding: "2rem", borderRadius: "var(--radius-lg)", color: "#fff", boxShadow: "var(--shadow-purple)", display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>Network Average Score</span>
                <div style={{ fontSize: "4rem", fontWeight: 400, fontFamily: "var(--font-heading)", lineHeight: 1, display: "flex", alignItems: "baseline", gap: "8px" }}>
                  {avgScore} <span style={{ fontSize: "1.25rem", opacity: 0.6, fontFamily: "sans-serif" }}>/ 35</span>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", width: "80px", height: "80px", borderRadius: "50%", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <BarChart3 size={48} color="#fff" />
              </div>
            </motion.div>
          </div>

          {/* Right Column: Analytics Charts */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: "#fff", padding: "1.5rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-sm)" }}>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", marginBottom: "1rem" }}>Pillar Averages</h3>
              <div style={{ flex: 1, minHeight: "220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--color-text-muted)", fontSize: 10 }} />
                    <Radar 
                      name="Network" 
                      dataKey="A" 
                      stroke="var(--color-primary)" 
                      fill="var(--color-primary)" 
                      fillOpacity={0.4} 
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--shadow-md)" }} 
                      animationDuration={400}
                      animationEasing="ease-out"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", marginBottom: "1rem" }}>Maturity Distribution</h3>
              <div style={{ flex: 1, minHeight: "220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" cy="50%" 
                      innerRadius={55} outerRadius={80} 
                      paddingAngle={4} 
                      dataKey="value"
                      activeShape={renderActiveShape}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={bandColors[entry.name]?.chart || '#cbd5e1'} style={{ outline: 'none' }} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "var(--shadow-md)" }} 
                      animationDuration={400}
                      animationEasing="ease-out"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Data Table Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-light)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          
          {/* Command Bar */}
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border-light)", display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", position: "relative", flex: "1 1 350px", maxWidth: "500px" }}>
              <Search size={18} style={{ position: "absolute", left: "1rem", color: "var(--color-text-muted)" }} />
              <input
                type="text"
                style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.75rem", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-full)", fontSize: "0.9rem", outline: "none", transition: "all 0.2s" }}
                placeholder="Search companies, contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <Filter size={16} style={{ position: "absolute", left: "1rem", color: "var(--color-text-muted)", pointerEvents: "none" }} />
              <select 
                value={filterBand} 
                onChange={(e) => setFilterBand(e.target.value)}
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-full)", padding: "0.65rem 2.5rem 0.65rem 2.5rem", fontSize: "0.9rem", outline: "none", cursor: "pointer", fontWeight: 500, appearance: "none" }}
              >
                <option value="All">Maturity</option>
                <option value="Emerging">Emerging</option>
                <option value="Developing">Developing</option>
                <option value="Strategic">Strategic</option>
                <option value="Innovating">Innovating</option>
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: "1rem", color: "var(--color-text-muted)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-2)", color: "var(--color-text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "1rem 1.5rem", cursor: "pointer", userSelect: "none", width: "35%" }} onClick={() => handleSort("company")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>Company <SortIcon columnKey="company" /></div>
                  </th>
                  <th style={{ padding: "1rem", cursor: "pointer", userSelect: "none", width: "15%" }} onClick={() => handleSort("size")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>Size <SortIcon columnKey="size" /></div>
                  </th>
                  <th style={{ padding: "1rem", cursor: "pointer", userSelect: "none", width: "20%" }} onClick={() => handleSort("score")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>Score <SortIcon columnKey="score" /></div>
                  </th>
                  <th style={{ padding: "1rem", cursor: "pointer", userSelect: "none", width: "20%" }} onClick={() => handleSort("band")}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>Maturity <SortIcon columnKey="band" /></div>
                  </th>
                  <th style={{ padding: "1rem 1.5rem", textAlign: "right", width: "10%" }}>Actions</th>
                </tr>
              </thead>
              <AnimatePresence mode="wait">
                <motion.tbody 
                  key={`page-${currentPage}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {paginatedSuppliers.map((supplier, index) => {
                    const latest = supplier.sged_assessments?.[0]; 
                    const bandStyle = latest ? (bandColors[latest.maturity_band as string] || bandColors['Emerging']) : null;
                    const initials = getInitials(supplier.company_name);

                    return (
                      <motion.tr 
                        key={supplier.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        onClick={() => setSelectedSupplierId(supplier.id)}
                        style={{ 
                          borderBottom: "1px solid var(--color-border-light)",
                          cursor: "pointer",
                          transition: "background-color 0.2s ease",
                        }}
                        className="admin-row-hover"
                      >
                        <td style={{ padding: "1.25rem 1.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--color-primary-alpha)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700, flexShrink: 0 }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#000", fontSize: "0.95rem", marginBottom: "0.15rem" }}>{supplier.company_name}</div>
                              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                                {supplier.contact_name} · <span style={{ color: "var(--color-primary)" }}>{supplier.contact_email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "1.25rem 1rem", fontSize: "0.875rem", color: "var(--color-text)" }}>{supplier.company_size || "—"}</td>
                        <td style={{ padding: "1.25rem 1rem" }}>
                          {latest ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div style={{ fontWeight: 700, color: "#000", fontSize: "1rem" }}>{latest.total_score}</div>
                              <div style={{ height: "4px", width: "40px", background: "var(--color-border-light)", borderRadius: "2px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${(latest.total_score / 35) * 100}%`, background: "var(--color-primary)", borderRadius: "2px" }} />
                              </div>
                            </div>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "1.25rem 1rem" }}>
                          {latest && bandStyle ? (
                            <span style={{ 
                              padding: "0.35rem 0.8rem", 
                              background: bandStyle.bg, 
                              color: bandStyle.text,
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              boxShadow: `inset 0 0 0 1px ${bandStyle.border}`
                            }}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: bandStyle.text }} />
                              {latest.maturity_band}
                            </span>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                          <motion.button 
                            whileHover={{ scale: 1.05, backgroundColor: "var(--color-primary)", color: "#fff", borderColor: "var(--color-primary)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            style={{ 
                              background: "#fff", 
                              border: "1px solid var(--color-border)", 
                              borderRadius: "var(--radius-full)", 
                              padding: "0.4rem 0.8rem", 
                              display: "inline-flex", 
                              alignItems: "center", 
                              gap: "0.25rem", 
                              fontSize: "0.75rem", 
                              fontWeight: 600, 
                              color: "var(--color-text-muted)", 
                              cursor: "pointer", 
                              boxShadow: "var(--shadow-sm)"
                            }}
                          >
                            View <ArrowUpRight size={14} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })}
                  
                  {paginatedSuppliers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", background: "var(--color-surface-2)", color: "var(--color-text-light)", marginBottom: "1rem" }}>
                          <Search size={32} />
                        </div>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "#000", fontWeight: 600 }}>No results found</h3>
                        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Try adjusting your search or filters.</p>
                      </td>
                    </tr>
                  )}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>

          {/* Pagination */}
          {filteredSuppliers.length > 0 && (
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-surface-2)" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 500 }}>
                Showing <span style={{ color: "#000" }}>{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredSuppliers.length)}</span> of <span style={{ color: "#000" }}>{filteredSuppliers.length}</span> companies
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-secondary" style={{ padding: "0.4rem 0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", border: "1px solid var(--color-border)" }}>
                  <ChevronLeft size={16} /> Prev
                </button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-secondary" style={{ padding: "0.4rem 0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.25rem", border: "1px solid var(--color-border)" }}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Slide-out Drawer (Backdrop + Panel) */}
      <AnimatePresence>
        {selectedSupplierId && selectedSupplier && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSupplierId(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", zIndex: 100 }}
            />
            <motion.div 
              initial={{ x: "100%", boxShadow: "0 0 0 rgba(0,0,0,0)" }}
              animate={{ x: 0, boxShadow: "-24px 0 48px rgba(0,0,0,0.15)" }}
              exit={{ x: "100%", boxShadow: "0 0 0 rgba(0,0,0,0)" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "650px", background: "#fff", zIndex: 101, display: "flex", flexDirection: "column", overflow: "hidden" }}
            >
              {/* Drawer Header */}
              <div style={{ padding: "2rem", borderBottom: "1px solid var(--color-border-light)", background: "var(--color-surface-2)", position: "relative" }}>
                <button onClick={() => setSelectedSupplierId(null)} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "#fff", border: "1px solid var(--color-border)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--color-text)", boxShadow: "var(--shadow-sm)", zIndex: 10 }}>
                  <X size={16} />
                </button>
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--color-primary-alpha)", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, flexShrink: 0 }}>
                    {getInitials(selectedSupplier.company_name)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.5rem", color: "#000", fontWeight: 400, fontFamily: "var(--font-heading)", margin: "0 0 0.25rem", lineHeight: 1.1 }}>
                      {selectedSupplier.company_name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                      <span>{selectedSupplier.industry_sector}</span>
                      <span style={{ color: "var(--color-border)" }}>|</span>
                      <span>{selectedSupplier.company_size} employees</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Body */}
              <div style={{ padding: "2rem", overflowY: "auto", flex: 1 }}>
                
                {/* Contact Card */}
                <div style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", padding: "1.25rem", border: "1px solid var(--color-border-light)", marginBottom: "2rem" }}>
                  <h4 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", margin: "0 0 1rem" }}>Contact Information</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-border)" }}><User size={14} color="var(--color-text)" /></div>
                      <span style={{ fontWeight: 500, color: "#000" }}>{selectedSupplier.contact_name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-border)" }}><Mail size={14} color="var(--color-text)" /></div>
                      <a href={`mailto:${selectedSupplier.contact_email}`} style={{ color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>{selectedSupplier.contact_email}</a>
                    </div>
                  </div>
                </div>

                {/* Assessment Area */}
                {assessments.length > 0 ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#000", margin: 0 }}>Diagnostic Results</h4>
                      {assessments.length > 1 && (
                        <select 
                          value={selectedAssessmentId || ""} 
                          onChange={(e) => setSelectedAssessmentId(e.target.value)}
                          style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-full)", padding: "0.4rem 1.5rem 0.4rem 1rem", fontSize: "0.8rem", outline: "none", cursor: "pointer" }}
                        >
                          {assessments.map((a: any, index: number) => (
                            <option key={a.id} value={a.id}>
                              {new Date(a.created_at).toLocaleDateString()} {index === 0 ? "(Latest)" : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {activeAssessment && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={activeAssessment.id}>
                        
                        {/* Score Hero */}
                        <div style={{ display: "flex", alignItems: "stretch", gap: "1rem", marginBottom: "2rem" }}>
                          <div style={{ flex: 1, background: "linear-gradient(to bottom right, var(--color-primary-dark), var(--color-primary))", borderRadius: "var(--radius-md)", padding: "1.5rem", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.8, marginBottom: "0.25rem" }}>Total Score</span>
                            <div style={{ fontSize: "3rem", fontWeight: 400, fontFamily: "var(--font-heading)", lineHeight: 1, display: "flex", alignItems: "baseline", gap: "4px" }}>
                              {activeAssessment.total_score} <span style={{ fontSize: "1rem", opacity: 0.6, fontFamily: "sans-serif" }}>/ 35</span>
                            </div>
                          </div>
                          <div style={{ flex: 1, background: "var(--color-surface-2)", border: "1px solid var(--color-border-light)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Maturity Band</span>
                            {(() => {
                              const bStyle = bandColors[activeAssessment.maturity_band as string] || bandColors['Emerging'];
                              return (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: 700, color: bStyle.text }}>
                                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: bStyle.text, boxShadow: `0 0 8px ${bStyle.bg}` }} />
                                  {activeAssessment.maturity_band}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Pillar Scores */}
                        <div style={{ marginBottom: "2rem" }}>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", margin: "0 0 1.25rem" }}>Performance by Pillar</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {Object.entries(fullGoalLabelMap).map(([field, label]) => {
                              const score = activeAssessment[field] || 0;
                              return (
                                <div key={field}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#000", maxWidth: "80%", lineHeight: 1.3 }}>{label}</span>
                                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-primary)" }}>{score}/5</span>
                                  </div>
                                  <ScoreBar score={score} />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Demographics */}
                        {activeAssessment.workforce_female !== undefined && (
                          <div style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", padding: "1.25rem", border: "1px solid var(--color-border-light)" }}>
                            <h4 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", margin: "0 0 0.75rem" }}>Workforce Gender Split</h4>
                            <div style={{ display: "flex", width: "100%", height: "12px", borderRadius: "6px", overflow: "hidden", marginBottom: "0.5rem" }}>
                              <div style={{ width: `${activeAssessment.workforce_female}%`, background: "var(--color-primary)" }} />
                              <div style={{ width: `${activeAssessment.workforce_male}%`, background: "#f6911d" }} />
                              {activeAssessment.workforce_non_binary > 0 && <div style={{ width: `${activeAssessment.workforce_non_binary}%`, background: "#FFBB2B" }} />}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.8rem", color: "var(--color-text)" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "var(--color-primary)" }} /> {activeAssessment.workforce_female}% F</div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#f6911d" }} /> {activeAssessment.workforce_male}% M</div>
                              {activeAssessment.workforce_non_binary > 0 && (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#FFBB2B" }} /> {activeAssessment.workforce_non_binary}% NB</div>
                              )}
                            </div>
                          </div>
                        )}

                      </motion.div>
                    )}
                  </>
                ) : (
                  <div style={{ padding: "3rem 1rem", textAlign: "center", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", border: "1px dashed var(--color-border)" }}>
                    <Calendar size={32} color="var(--color-text-light)" style={{ margin: "0 auto 1rem" }} />
                    <h4 style={{ fontSize: "1rem", color: "#000", fontWeight: 600, margin: "0 0 0.5rem" }}>No Assessments Yet</h4>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>This supplier has registered but hasn't submitted their diagnostic data.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Global CSS for Row Hover */}
      <style dangerouslySetInnerHTML={{__html: `
        .admin-row-hover:hover {
          background-color: var(--color-surface-2) !important;
        }
        .admin-row-hover:hover .hover-primary {
          color: var(--color-primary) !important;
          transform: scale(1.1);
        }
      `}} />
    </div>
  );
}
