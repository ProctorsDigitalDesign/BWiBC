"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Loader2,
  Building2, Mail, User, Briefcase, Users, AlertCircle, Info
} from "lucide-react";

const MATURITY_SCALE = [
  { value: 1, label: "Not in place",  desc: "No formal activity or commitment yet." },
  { value: 2, label: "Emerging",      desc: "Early discussions or pilot activity; no policy." },
  { value: 3, label: "Developing",    desc: "Policies exist; uneven implementation." },
  { value: 4, label: "Established",   desc: "Embedded practice with measurement." },
  { value: 5, label: "Leading",       desc: "Sector-leading; outcomes evidenced & shared." },
];

const GOALS = [
  {
    id: "flexible_working",
    title: "Flexible & Part-Time Working",
    description: "Does your organisation proactively offer and role-model flexible working at all levels?",
    questions: [
      "We comply with statutory flexible working request laws.",
      "We have a ‘Flexible by Default’ culture. Flexibility and leave policies are mentioned in all job ads, and we support menopause/menstrual health adjustments via manager-led accommodations.",
      "We have a market-leading approach (e.g., 4-day week) and a contractual ‘Right to Disconnect’ to prevent burnout."
    ]
  },
  {
    id: "senior_representation",
    title: "Representative Senior Leadership",
    description: "Do women, including those from marginalised backgrounds, have equal representation in your senior leadership and Board?",
    questions: [
      "We track gender representation at a high level.",
      "We set intersectional targets (Race/Disability/Class) and have audited our senior roles to remove ‘class-coded’ barriers (e.g., elite university bias).",
      "Executive bonuses are tied to D&I outcomes. We use live dashboards to ensure women move through the pipeline at the same velocity as men."
    ]
  },
  {
    id: "executive_accountability",
    title: "Executive Accountability & Safe Culture",
    description: "Is there clear executive accountability for gender equity and a proven ‘Preventative Duty’ regarding workplace safety?",
    questions: [
      "We have a named EDI lead and a standard anti-harassment policy.",
      "We meet the ‘Statutory Preventative Duty’ for sexual harassment. Our Employee Resource Groups (ERGs) are consulted on policy design, and we conduct workplace menopause risk assessments.",
      "We provide independent, third-party reporting lines for harassment and offer paid leave for domestic abuse survivors."
    ]
  },
  {
    id: "frontline_progression",
    title: "Progression from Lower-Paid Roles",
    description: "Do you have clear pathways to management for women in frontline, operational, or lower-paid roles?",
    questions: [
      "Internal vacancies are posted on staff boards/intranets.",
      "We have removed degree requirements from internal roles and budget for childcare/travel costs to ensure lower-paid staff can attend training.",
      "We benchmark social mobility and provide ‘Cultural Capital’ coaching to women from working-class backgrounds to support their progression."
    ]
  },
  {
    id: "intersectional_pay_gap",
    title: "Closing the Intersectional Pay Gap",
    description: "Are you transparent about pay and committed to closing intersectional pay and pension gaps?",
    questions: [
      "We complete statutory Gender Pay Gap reporting.",
      "We are an accredited Real Living Wage employer. We publish salary bands internally and state salary ranges on all job ads.",
      "We maintain full employer pension contributions during the entire duration of all parental leave to mitigate the ‘motherhood pension gap’."
    ]
  },
  {
    id: "bias_free_recruitment",
    title: "Bias-Free Recruitment & Appraisals",
    description: "Are your recruitment and performance systems designed to be neuro-inclusive and free from systemic bias?",
    questions: [
      "Hiring managers take basic unconscious bias training.",
      "We share interview questions 48 hours in advance (Neuro-inclusion) and use blind-screening (removing names/universities) for all CVs.",
      "We use AI or peer-audits to ensure performance appraisal language is objective. Our HR systems are fully trans-inclusive by design."
    ]
  },
  {
    id: "sponsorship_networks",
    title: "Mentoring, Sponsorship & Networks",
    description: "Do you provide women with the social capital and networking opportunities needed to thrive?",
    questions: [
      "We have a women’s network that holds social events.",
      "Our network leadership is intersectional, and we have a dedicated budget for external coaching for underrepresented women.",
      "We have a mandatory Reverse Mentoring programme for senior leaders. We require our own sub-contractors to meet equity standards."
    ]
  }
];

const TOTAL_STEPS = GOALS.length + 2; // Intro + 7 goals + Intake

export default function AssessmentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Nested scores: { goalId: { qIndex: score } }
  const [scores, setScores] = useState<Record<string, Record<number, number>>>(
    GOALS.reduce((acc, goal) => ({ ...acc, [goal.id]: { 0: 0, 1: 0, 2: 0 } }), {})
  );

  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    company_size: "",
    industry_sector: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const handlePrev = () => {
    if (step > 0) { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const handleScoreChange = (goalId: string, qIndex: number, value: number) => {
    setScores(prev => ({ ...prev, [goalId]: { ...prev[goalId], [qIndex]: value } }));
  };

  const isCurrentStepValid = () => {
    if (step === 0) return true; // Intro
    if (step > GOALS.length) return true; // Intake
    const s = scores[GOALS[step - 1].id];
    return s[0] > 0 && s[1] > 0 && s[2] > 0;
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) setFormErrors(p => ({ ...p, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.company_name.trim())  errs.company_name   = "Company name is required";
    if (!formData.contact_name.trim())  errs.contact_name   = "Your name is required";
    if (!/\S+@\S+\.\S+/.test(formData.contact_email.trim())) errs.contact_email = "Valid work email required";
    if (!formData.company_size)         errs.company_size   = "Please select a company size";
    if (!formData.industry_sector)      errs.industry_sector = "Please select a sector";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const averagedScores: Record<string, number> = {};
      Object.keys(scores).forEach(goalId => {
        const q = scores[goalId];
        averagedScores[goalId] = Math.round((q[0] + q[1] + q[2]) / 3);
      });

      const res = await fetch("/api/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, scores: averagedScores })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      sessionStorage.setItem("sged_result", JSON.stringify(data));
      router.push("/results");
    } catch (err: any) {
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  };

  // ─── Sub-renders ──────────────────────────────────────────────────────────

  const renderProgressBar = () => {
    if (step === 0) return null; // Hide progress bar on intro step

    const adjustedStep = step - 1; // 0-based for goals
    const totalProgressSteps = GOALS.length + 1; // 7 goals + intake
    const pct = Math.round(((adjustedStep + 1) / totalProgressSteps) * 100);

    return (
      <div className="progress-wrapper">
        <div className="progress-meta">
          <span className="progress-label">
            {adjustedStep < GOALS.length ? `Goal ${adjustedStep + 1} of ${GOALS.length}` : "Company Details"}
          </span>
          <span className="progress-pct">{pct}% complete</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="step-dots" aria-hidden="true">
          {Array.from({ length: totalProgressSteps }).map((_, i) => (
            <div
              key={i}
              className={`step-dot ${i < adjustedStep ? "completed" : ""} ${i === adjustedStep ? "active" : ""}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderIntroStep = () => (
    <div className="card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
      <div style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        justifyContent: "center", 
        width: "64px", 
        height: "64px", 
        borderRadius: "50%", 
        background: "var(--color-primary-alpha)", 
        color: "var(--color-primary)", 
        marginBottom: "1.5rem" 
      }}>
        <Building2 size={32} />
      </div>
      <h1 style={{ marginBottom: "1rem" }}>Supplier Gender Equity Diagnostic</h1>
      <p style={{ fontSize: "1.125rem", color: "var(--color-text)", maxWidth: "650px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
        Welcome to the West of England Women in Business Charter's Supplier Gender Equity Diagnostic. 
        This tool helps you assess your organisation's maturity across 7 key goals related to gender equity in the workplace.
      </p>
      
      <div style={{ background: "var(--color-surface-2)", padding: "1.5rem", borderRadius: "var(--radius-md)", textAlign: "left", maxWidth: "600px", margin: "0 auto 2.5rem", border: "1px solid var(--color-border-light)" }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Info size={16} style={{ color: "var(--color-primary)" }} /> What to expect
        </h3>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--color-text-muted)", fontSize: "0.9375rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <li>You will be asked 3 granular questions across 7 goals (21 questions total).</li>
          <li>For each question, select the option from "Not in place" to "Leading" that best reflects your current organisational practice.</li>
          <li>The assessment takes approximately 5-10 minutes to complete.</li>
          <li>At the end, you'll receive a detailed maturity scorecard and tailored procurement advice.</li>
        </ul>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ fontSize: "1.0625rem", padding: "1rem 2.5rem" }}
        onClick={handleNext}
      >
        Start Diagnostic
      </button>
    </div>
  );

  const renderAssessmentStep = () => {
    const goalIndex = step - 1;
    const goal = GOALS[goalIndex];
    const currentScores = scores[goal.id];
    const answered = [0, 1, 2].filter(i => currentScores[i] > 0).length;

    return (
      <div className="card">
        {/* Goal Header */}
        <div className="goal-header">
          <div className="goal-badge">
            <span>Goal {goalIndex + 1} of {GOALS.length}</span>
          </div>
          <h2>{goal.title}</h2>
          <p className="goal-question">&ldquo;{goal.description}&rdquo;</p>
        </div>

        {/* Questions */}
        {goal.questions.map((q, index) => {
          const isAnswered = currentScores[index] > 0;
          return (
            <div key={index} className="question-block">
              <p className="question-text">
                <span style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  width: "20px", 
                  height: "20px", 
                  borderRadius: "50%",
                  background: isAnswered ? "var(--color-primary)" : "var(--color-border)",
                  color: isAnswered ? "white" : "var(--color-text-muted)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  marginRight: "0.5rem",
                  verticalAlign: "middle",
                  flexShrink: 0,
                  fontFamily: "var(--font-heading)",
                  transition: "background-color 0.2s ease, color 0.2s ease"
                }}>
                  {index + 1}
                </span>
                {q}
              </p>

              <div className="scale-grid" role="group" aria-label={`Rating for question ${index + 1}`}>
                {MATURITY_SCALE.map((scale) => {
                  const isSelected = currentScores[index] === scale.value;
                  return (
                    <button
                      key={scale.value}
                      type="button"
                      onClick={() => handleScoreChange(goal.id, index, scale.value)}
                      aria-pressed={isSelected}
                      className={`scale-button ${isSelected ? "selected" : ""}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleScoreChange(goal.id, index, scale.value);
                        }
                      }}
                    >
                      <div className="scale-num">{scale.value}</div>
                      <div className="scale-label-text">{scale.label}</div>
                      <div className="scale-desc-text">{scale.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Navigation */}
        <div className="form-nav">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
          >
            Back
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {!isCurrentStepValid() && (
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                {answered}/3 answered
              </span>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!isCurrentStepValid()}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderIntakeStep = () => (
    <div className="card">
      <div className="intake-header">
        <div className="intake-icon">
          <Users size={24} aria-hidden="true" />
        </div>
        <h2>Almost there — tell us about your organisation</h2>
        <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
          Your details are kept securely and used only to generate and save your diagnostic report.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} noValidate>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="company_name">
              <Building2 size={15} className="label-icon" aria-hidden="true" />
              Company Name
            </label>
            <input
              type="text"
              id="company_name"
              name="company_name"
              className="form-input"
              value={formData.company_name}
              onChange={handleFormChange}
              placeholder="e.g. Acme Corp…"
              autoComplete="organization"
              spellCheck={false}
            />
            {formErrors.company_name && (
              <p className="form-error" role="alert">
                <AlertCircle size={13} aria-hidden="true" /> {formErrors.company_name}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contact_name">
              <User size={15} className="label-icon" aria-hidden="true" />
              Your Name
            </label>
            <input
              type="text"
              id="contact_name"
              name="contact_name"
              className="form-input"
              value={formData.contact_name}
              onChange={handleFormChange}
              placeholder="e.g. Jane Smith…"
              autoComplete="name"
            />
            {formErrors.contact_name && (
              <p className="form-error" role="alert">
                <AlertCircle size={13} aria-hidden="true" /> {formErrors.contact_name}
              </p>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="contact_email">
            <Mail size={15} className="label-icon" aria-hidden="true" />
            Work Email
          </label>
          <input
            type="email"
            id="contact_email"
            name="contact_email"
            className="form-input"
            value={formData.contact_email}
            onChange={handleFormChange}
            placeholder="jane.smith@yourcompany.com…"
            autoComplete="email"
            spellCheck={false}
          />
          {formErrors.contact_email && (
            <p className="form-error" role="alert">
              <AlertCircle size={13} aria-hidden="true" /> {formErrors.contact_email}
            </p>
          )}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="company_size">
              <Users size={15} className="label-icon" aria-hidden="true" />
              Company Size
            </label>
            <select
              id="company_size"
              name="company_size"
              className="form-select"
              value={formData.company_size}
              onChange={handleFormChange}
            >
              <option value="">Select size…</option>
              <option value="1–10">1–10 employees</option>
              <option value="11–50">11–50 employees</option>
              <option value="51–250">51–250 employees</option>
              <option value="251+">251+ employees</option>
            </select>
            {formErrors.company_size && (
              <p className="form-error" role="alert">
                <AlertCircle size={13} aria-hidden="true" /> {formErrors.company_size}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="industry_sector">
              <Briefcase size={15} className="label-icon" aria-hidden="true" />
              Industry Sector
            </label>
            <select
              id="industry_sector"
              name="industry_sector"
              className="form-select"
              value={formData.industry_sector}
              onChange={handleFormChange}
            >
              <option value="">Select sector…</option>
              <option value="Technology">Technology & IT</option>
              <option value="Finance">Finance & Professional Services</option>
              <option value="Manufacturing">Manufacturing & Engineering</option>
              <option value="Healthcare">Healthcare & Life Sciences</option>
              <option value="Retail">Retail & Consumer Goods</option>
              <option value="Education">Education & Public Sector</option>
              <option value="Other">Other</option>
            </select>
            {formErrors.industry_sector && (
              <p className="form-error" role="alert">
                <AlertCircle size={13} aria-hidden="true" /> {formErrors.industry_sector}
              </p>
            )}
          </div>
        </div>

        {submitError && (
          <div className="error-banner" role="alert">
            <AlertCircle size={16} aria-hidden="true" /> {submitError}
          </div>
        )}

        <div className="form-nav">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={isSubmitting}
          >
            Back
          </button>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} aria-hidden="true" style={{ animation: "spin 0.8s linear infinite" }} />
                Generating Results…
              </>
            ) : (
              <>
                <CheckCircle2 size={16} aria-hidden="true" />
                Submit Assessment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // ─── Root ─────────────────────────────────────────────────────────────────
  return (
    <div className="container" style={{ paddingTop: "2.5rem" }}>
      {renderProgressBar()}
      {step === 0 && renderIntroStep()}
      {step > 0 && step <= GOALS.length && renderAssessmentStep()}
      {step > GOALS.length && renderIntakeStep()}
    </div>
  );
}
