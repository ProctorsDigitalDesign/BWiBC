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
    question: "Does your organisation proactively offer and role-model flexible working at all levels?",
    levels: [
      { value: 1, label: "Level 1: Compliance", text: "We comply with statutory flexible working request laws." },
      { value: 3, label: "Level 3: Developing", text: "We have a ‘Flexible by Default’ culture. Flexibility and leave policies are mentioned in all job ads, and we support menopause/menstrual health adjustments via manager-led accommodations." },
      { value: 5, label: "Level 5: Leading", text: "We have a market-leading approach (e.g., 4-day week) and a contractual ‘Right to Disconnect’ to prevent burnout." }
    ]
  },
  {
    id: "senior_representation",
    title: "Representative Senior Leadership",
    question: "Do women, including those from marginalised backgrounds, have equal representation in your senior leadership and Board?",
    levels: [
      { value: 1, label: "Level 1: Compliance", text: "We track gender representation at a high level." },
      { value: 3, label: "Level 3: Developing", text: "We set intersectional targets (Race/Disability/Class) and have audited our senior roles to remove ‘class-coded’ barriers (e.g., elite university bias)." },
      { value: 5, label: "Level 5: Leading", text: "Executive bonuses are tied to D&I outcomes. We use live dashboards to ensure women move through the pipeline at the same velocity as men." }
    ]
  },
  {
    id: "executive_accountability",
    title: "Executive Accountability & Safe Culture",
    question: "Is there clear executive accountability for gender equity and a proven ‘Preventative Duty’ regarding workplace safety?",
    levels: [
      { value: 1, label: "Level 1: Compliance", text: "We have a named EDI lead and a standard anti-harassment policy." },
      { value: 3, label: "Level 3: Developing", text: "We meet the ‘Statutory Preventative Duty’ for sexual harassment. Our Employee Resource Groups (ERGs) are consulted on policy design, and we conduct workplace menopause risk assessments." },
      { value: 5, label: "Level 5: Leading", text: "We provide independent, third-party reporting lines for harassment and offer paid leave for domestic abuse survivors." }
    ]
  },
  {
    id: "frontline_progression",
    title: "Progression from Lower-Paid Roles",
    question: "Do you have clear pathways to management for women in frontline, operational, or lower-paid roles?",
    levels: [
      { value: 1, label: "Level 1: Compliance", text: "Internal vacancies are posted on staff boards/intranets." },
      { value: 3, label: "Level 3: Developing", text: "We have removed degree requirements from internal roles and budget for childcare/travel costs to ensure lower-paid staff can attend training." },
      { value: 5, label: "Level 5: Leading", text: "We benchmark social mobility and provide ‘Cultural Capital’ coaching to women from working-class backgrounds to support their progression." }
    ]
  },
  {
    id: "intersectional_pay_gap",
    title: "Closing the Intersectional Pay Gap",
    question: "Are you transparent about pay and committed to closing intersectional pay and pension gaps?",
    levels: [
      { value: 1, label: "Level 1: Compliance", text: "We complete statutory Gender Pay Gap reporting." },
      { value: 3, label: "Level 3: Developing", text: "We are an accredited Real Living Wage employer. We publish salary bands internally and state salary ranges on all job ads." },
      { value: 5, label: "Level 5: Leading", text: "We maintain full employer pension contributions during the entire duration of all parental leave to mitigate the ‘motherhood pension gap’." }
    ]
  },
  {
    id: "bias_free_recruitment",
    title: "Bias-Free Recruitment & Appraisals",
    question: "Are your recruitment and performance systems designed to be neuro-inclusive and free from systemic bias?",
    levels: [
      { value: 1, label: "Level 1: Compliance", text: "Hiring managers take basic unconscious bias training." },
      { value: 3, label: "Level 3: Developing", text: "We share interview questions 48 hours in advance (Neuro-inclusion) and use blind-screening (removing names/universities) for all CVs." },
      { value: 5, label: "Level 5: Leading", text: "We use AI or peer-audits to ensure performance appraisal language is objective. Our HR systems are fully trans-inclusive by design." }
    ]
  },
  {
    id: "sponsorship_networks",
    title: "Mentoring, Sponsorship & Networks",
    question: "Do you provide women with the social capital and networking opportunities needed to thrive?",
    levels: [
      { value: 1, label: "Level 1: Compliance", text: "We have a women’s network that holds social events." },
      { value: 3, label: "Level 3: Developing", text: "Our network leadership is intersectional, and we have a dedicated budget for external coaching for underrepresented women." },
      { value: 5, label: "Level 5: Leading", text: "We have a mandatory Reverse Mentoring programme for senior leaders. We require our own sub-contractors to meet equity standards." }
    ]
  }
];

const TOTAL_STEPS = GOALS.length + 2; // Intro + 7 goals + Intake

export default function AssessmentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Scores: { goalId: score }
  const [scores, setScores] = useState<Record<string, number>>(
    GOALS.reduce((acc, goal) => ({ ...acc, [goal.id]: 0 }), {})
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

  const handleScoreChange = (goalId: string, value: number) => {
    setScores(prev => ({ ...prev, [goalId]: value }));
  };

  const isCurrentStepValid = () => {
    if (step === 0) return true; // Intro
    if (step > GOALS.length) return true; // Intake
    const s = scores[GOALS[step - 1].id];
    return s > 0;
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
      const res = await fetch("/api/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, scores })
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
          <Info size={16} style={{ color: "var(--color-primary)" }} /> How to take the assessment
        </h3>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--color-text-muted)", fontSize: "0.9375rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <li>You’ll be asked a single maturity question across 7 key goals.</li>
          <li>For each goal, select the option (choosing from Level 1, 3 or 5) that best reflects your current organisational practice. You’ll have the opportunity for a more granular assessment once you’ve run this initial diagnostic.</li>
          <li>The assessment takes approximately 5 minutes to complete.</li>
          <li>At the end, you'll receive a detailed maturity scorecard and recommended next steps.</li>
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
    const currentScore = scores[goal.id];

    return (
      <div className="card">
        {/* Goal Header */}
        <div className="goal-header">
          <div className="goal-badge">
            <span>Goal {goalIndex + 1} of {GOALS.length}</span>
          </div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{goal.title}</h2>
          <p className="goal-question" style={{ fontSize: "1.125rem", fontStyle: "normal", color: "var(--color-text)", fontWeight: 500, margin: "0.75rem 0 0" }}>
            {goal.question}
          </p>
        </div>

        {/* Levels List */}
        <div className="scale-grid" role="group" aria-label={`Maturity options for ${goal.title}`}>
          {goal.levels.map((level) => {
            const isSelected = currentScore === level.value;
            return (
              <button
                key={level.value}
                type="button"
                onClick={() => handleScoreChange(goal.id, level.value)}
                aria-pressed={isSelected}
                className={`scale-button ${isSelected ? "selected" : ""}`}
              >
                <div className="scale-num">{level.value}</div>
                <div className="scale-label-text">{level.label}</div>
                <div className="scale-desc-text">{level.text}</div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="form-nav" style={{ marginTop: "2rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
          >
            Back
          </button>

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
