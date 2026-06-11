"use client";

import { useState, useEffect } from "react";
import { Download, Search, Shield, Building2, Eye, LogOut, CheckCircle, Mail, User, Award, Calendar } from "lucide-react";

const goalLabelMap: Record<string, string> = {
  flexible_working: "Flexible & Part-Time Working",
  senior_representation: "Representative Senior Leadership",
  executive_accountability: "Executive Accountability & Safe Culture",
  frontline_progression: "Progression from Lower-Paid Roles",
  intersectional_pay_gap: "Closing the Intersectional Pay Gap",
  bias_free_recruitment: "Bias-Free Recruitment & Appraisals",
  sponsorship_networks: "Mentoring, Sponsorship & Networks"
};

const scoreLevels: Record<number, string> = {
  1: "Not in place",
  2: "Emerging",
  3: "Developing",
  4: "Established",
  5: "Leading"
};

// Band colors mapping
const bandColors: Record<string, { bg: string, text: string }> = {
  'Emerging': { bg: 'rgba(236, 30, 35, 0.1)', text: 'var(--color-action)' },
  'Developing': { bg: 'rgba(246, 145, 29, 0.1)', text: 'var(--color-orange)' },
  'Strategic': { bg: 'rgba(25, 171, 73, 0.1)', text: 'var(--color-green)' },
  'Innovating': { bg: 'rgba(245, 233, 22, 0.2)', text: '#b08d2b' },
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    const savedSecret = sessionStorage.getItem("wibc_admin_secret");
    if (savedSecret) {
      setSecret(savedSecret);
      authenticate(savedSecret);
    }
  }, []);

  const authenticate = async (secretKey: string) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/suppliers", {
        headers: { "x-admin-secret": secretKey },
      });

      if (!res.ok) {
        throw new Error("Invalid admin secret");
      }

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

  const filteredSuppliers = suppliers.filter((s) =>
    s.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Computed Stats
  const totalAssessments = suppliers.reduce((acc, s) => acc + (s.sged_assessments ? s.sged_assessments.length : 0), 0);
  
  const allScores = suppliers.flatMap(s => (s.sged_assessments || []).map((a: any) => a.total_score));
  const avgScore = allScores.length > 0 
    ? (allScores.reduce((sum, val) => sum + val, 0) / allScores.length).toFixed(1)
    : "—";

  // Selected supplier details
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);
  const assessments = selectedSupplier?.sged_assessments || [];
  
  // Set default assessment when supplier changes
  useEffect(() => {
    if (assessments.length > 0) {
      const hasAssessment = assessments.some((a: any) => a.id === selectedAssessmentId);
      if (!hasAssessment) {
        setSelectedAssessmentId(assessments[0].id);
      }
    } else {
      setSelectedAssessmentId(null);
    }
  }, [selectedSupplierId, assessments]);

  const activeAssessment = assessments.find((a: any) => a.id === selectedAssessmentId);

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ marginTop: "6rem", display: "flex", justifyContent: "center" }}>
        <div className="card" style={{ maxWidth: "450px", width: "100%", textAlign: "center", border: "1.5px solid var(--color-border)" }}>
          <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", background: "var(--color-primary-alpha)", color: "var(--color-primary)", marginBottom: "1.5rem" }}>
            <Shield size={36} />
          </div>
          <h2 style={{ marginBottom: "0.5rem" }}>Admin Portal</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", marginBottom: "2rem" }}>
            Enter the admin secret to access the diagnostic dashboard.
          </p>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Admin Secret Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password..."
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="error-banner" style={{ marginBottom: "1.5rem" }}>
                <span>{error}</span>
              </div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container" style={{ padding: "var(--space-2xl) var(--space-lg)" }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.75rem" }}>
            <Building2 size={28} /> WiBC Diagnostic Admin
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", marginTop: "0.25rem" }}>
            Monitor supplier submissions, view overall scores, and export data.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={handleDownloadCSV} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={handleLogout} className="btn btn-primary" style={{ backgroundColor: "var(--color-action)" }}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Suppliers</span>
          <span style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>{suppliers.length}</span>
        </div>
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Submissions</span>
          <span style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-magenta)", fontFamily: "var(--font-heading)" }}>{totalAssessments}</span>
        </div>
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Average Total Score</span>
          <span style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--color-green)", fontFamily: "var(--font-heading)" }}>{avgScore} <span style={{ fontSize: "1.25rem", color: "var(--color-text-light)" }}>/ 35</span></span>
        </div>
      </div>

      {/* Main Grid: Directory on left (or full), Details on right */}
      <div className={`admin-main-grid ${selectedSupplierId ? "with-sidebar" : ""}`}>
        
        {/* Suppliers List */}
        <div className="card" style={{ padding: "1.5rem", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", color: "var(--color-text-muted)" }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "2.5rem" }}
              placeholder="Search suppliers by name, contact, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)", color: "var(--color-text-muted)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "1rem 0.75rem" }}>Company</th>
                  <th style={{ padding: "1rem 0.75rem" }}>Contact</th>
                  <th style={{ padding: "1rem 0.75rem" }}>Size</th>
                  <th style={{ padding: "1rem 0.75rem" }}>Latest Score</th>
                  <th style={{ padding: "1rem 0.75rem" }}>Band</th>
                  <th style={{ padding: "1rem 0.75rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => {
                  const latest = supplier.sged_assessments?.[0]; // ordered by created_at desc
                  const isSelected = selectedSupplierId === supplier.id;
                  const currentBandStyle = latest ? (bandColors[latest.maturity_band as string] || bandColors['Emerging']) : null;

                  return (
                    <tr 
                      key={supplier.id} 
                      style={{ 
                        borderBottom: "1px solid var(--color-border-light)",
                        backgroundColor: isSelected ? "var(--color-primary-alpha)" : "transparent",
                        transition: "background-color 0.2s ease"
                      }}
                    >
                      <td style={{ padding: "1rem 0.75rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--color-text)" }}>{supplier.company_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{supplier.industry_sector}</div>
                      </td>
                      <td style={{ padding: "1rem 0.75rem" }}>
                        <div style={{ fontWeight: 500 }}>{supplier.contact_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{supplier.contact_email}</div>
                      </td>
                      <td style={{ padding: "1rem 0.75rem", fontSize: "0.875rem" }}>{supplier.company_size}</td>
                      <td style={{ padding: "1rem 0.75rem" }}>
                        {latest ? (
                          <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                            {latest.total_score} <span style={{ fontSize: "0.75rem", color: "var(--color-text-light)", fontWeight: 500 }}>/ 35</span>
                          </div>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "1rem 0.75rem" }}>
                        {latest && currentBandStyle ? (
                          <span style={{ 
                            padding: "0.25rem 0.625rem", 
                            background: currentBandStyle.bg, 
                            color: currentBandStyle.text,
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.75rem",
                            fontWeight: 700
                          }}>
                            {latest.maturity_band}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "1rem 0.75rem", textAlign: "right" }}>
                        <button 
                          onClick={() => setSelectedSupplierId(isSelected ? null : supplier.id)} 
                          className="btn btn-secondary"
                          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8125rem", border: isSelected ? "1.5px solid var(--color-primary)" : undefined }}
                        >
                          <Eye size={14} /> {isSelected ? "Hide Details" : "View Details"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                      No suppliers found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Supplier Details Panel */}
        {selectedSupplierId && selectedSupplier && (
          <div className="card" style={{ padding: "1.75rem", border: "1.5px solid var(--color-primary-light)", position: "sticky", top: "100px" }}>
            
            {/* Header */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "start", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", color: "var(--color-primary)", fontWeight: 700 }}>
                  {selectedSupplier.company_name}
                </h3>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                  {selectedSupplier.industry_sector} sector
                </span>
              </div>
              <button 
                onClick={() => setSelectedSupplierId(null)} 
                className="btn btn-secondary"
                style={{ padding: "0.25rem 0.5rem", minWidth: "auto", border: "none", color: "var(--color-text-muted)" }}
              >
                Close
              </button>
            </div>

            {/* Supplier Meta */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", background: "var(--color-surface-2)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <User size={14} style={{ color: "var(--color-primary)" }} />
                <span><strong>Contact:</strong> {selectedSupplier.contact_name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Mail size={14} style={{ color: "var(--color-primary)" }} />
                <span><strong>Email:</strong> <a href={`mailto:${selectedSupplier.contact_email}`} style={{ textDecoration: "underline" }}>{selectedSupplier.contact_email}</a></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Building2 size={14} style={{ color: "var(--color-primary)" }} />
                <span><strong>Size:</strong> {selectedSupplier.company_size} employees</span>
              </div>
            </div>

            {/* Assessment Selector (if multiple) */}
            {assessments.length > 1 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Select Submission History:</label>
                <select 
                  className="form-select" 
                  value={selectedAssessmentId || ""} 
                  onChange={(e) => setSelectedAssessmentId(e.target.value)}
                  style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
                >
                  {assessments.map((a: any, index: number) => (
                    <option key={a.id} value={a.id}>
                      {new Date(a.created_at).toLocaleDateString()} (Score: {a.total_score}/35) {index === 0 ? "(Latest)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Active Assessment Score Overview */}
            {activeAssessment ? (
              <div>
                <div style={{ 
                  display: "flex", 
                  flexWrap: "wrap",
                  justifyContent: "space-between", 
                  alignItems: "start", 
                  gap: "1rem",
                  background: "var(--color-primary-alpha)", 
                  padding: "1rem", 
                  borderRadius: "var(--radius-md)", 
                  marginBottom: "1.5rem" 
                }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Submission Date</div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.15rem" }}>
                      <Calendar size={14} />
                      {new Date(activeAssessment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Maturity Band</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-primary)" }}>
                      {activeAssessment.maturity_band}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Score</div>
                    <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>
                      {activeAssessment.total_score} <span style={{ fontSize: "0.75rem", color: "var(--color-text-light)", fontWeight: 500 }}>/35</span>
                    </div>
                  </div>
                </div>

                {/* Individual Goal Responses */}
                <h4 style={{ fontSize: "0.9375rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", borderBottom: "1.5px solid var(--color-border-light)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                  Responses by Goal (1-5 Scale)
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {Object.entries(goalLabelMap).map(([field, label]) => {
                    const score = activeAssessment[field] || 0;
                    return (
                      <div key={field}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text)" }}>{label}</span>
                          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-primary)" }}>
                            {score} <span style={{ fontSize: "0.75rem", color: "var(--color-text-light)", fontWeight: 500 }}>/ 5</span>
                          </span>
                        </div>
                        
                        {/* Rating block pills */}
                        <div style={{ display: "flex", gap: "6px", marginTop: "0.4rem" }}>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <div 
                              key={num}
                              style={{
                                flex: 1,
                                height: "7px",
                                borderRadius: "var(--radius-full)",
                                backgroundColor: num <= score ? "var(--color-primary)" : "var(--color-border-light)",
                                transition: "background-color 0.2s ease"
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                          <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                            {scoreLevels[score] || "Unknown"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* HubSpot integration status */}
                <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>HubSpot Status:</span>
                  {activeAssessment.hubspot_synced ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--color-success)", fontWeight: 600 }}>
                      <CheckCircle size={14} /> Synced
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-text-muted)" }}>Not Synced</span>
                  )}
                </div>

              </div>
            ) : (
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>No assessment selected.</p>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
