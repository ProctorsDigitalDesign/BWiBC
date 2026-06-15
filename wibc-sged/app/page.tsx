"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Loader2,
  Building2, Mail, User, Briefcase, Users, AlertCircle, Info, Trash2, Plus, Upload
} from "lucide-react";

const GOALS = [
  {
    id: "flexible_working",
    title: "Flexible & Part-Time Working",
    question: "Does your organisation proactively offer and role-model flexible working at all levels?",
    layout: "grid-3",
    levels: [
      { value: 1, label: "Foundational", text: "A ‘Ways of Working’ policy exists including flexible working and hybrid working standards. Formal Flexible Working Requests are handled on a case-by-case basis as per statutory law." },
      { value: 2, label: "Developing", text: "Flexibility and available options are proactively mentioned in all job adverts. Senior leaders work hybrid or part-time and are visible role models." },
      { value: 3, label: "Embedding", text: "A ‘Flexible by Default’ culture is adopted; the business must prove a role cannot be flexible rather than the employee proving it can. Disability-related flexibility is an accepted ‘Reasonable Adjustment’. Support for menopause and menstrual health is formalised." },
      { value: 4, label: "Strategic", text: "Managers are trained in output-based performance (results over ‘presenteeism’). High-spec hardware and ergonomic tools are provided to all remote/hybrid staff. Equitable employee comms, engagement and networking opportunities are guaranteed regardless of location or hours worked." },
      { value: 5, label: "Innovating", text: "A market-leading approach to ways of working (e.g. 4-day week / 9 day fortnight) is in place. A ‘Right to Disconnect’ is contractually enforced, protecting employees from ‘always-on’ culture and burnout. Intersectional uptake data is reviewed monthly by the Board." }
    ]
  },
  {
    id: "senior_representation",
    title: "Representative Senior Leadership",
    question: "Do women, including those from marginalised backgrounds, have equal representation in your senior leadership and Board?",
    layout: "grid-3",
    levels: [
      { value: 1, label: "Foundational", text: "Gender representation is tracked at a high level. A basic commitment to diversity is included in the annual report." },
      { value: 2, label: "Developing", text: "The organisation sets internal gender targets. ‘Stay and develop interviews’ are conducted with women in middle management to understand retention and support progression." },
      { value: 3, label: "Embedding", text: "Intersectional data is collected. Specific targets are set for women of all backgrounds (Race/Disability/Class/Sexuality) to be represented at all levels. Role profiles are audited to remove class-coded requirements (e.g. university bias)." },
      { value: 4, label: "Strategic", text: "A formal ‘Sponsorship’ programme exists where C-suite leaders use their influence to pull marginalised women into high-level rooms. Promotion and interview panels are always diverse, using external advisors where necessary." },
      { value: 5, label: "Innovating", text: "Executive bonuses are directly linked to intersectional diversity outcomes. Radical transparency: External data dashboards measure the ‘career velocity’ and progression of different demographic groups to drive investment." }
    ]
  },
  {
    id: "executive_accountability",
    title: "Executive Accountability & Safe Culture",
    question: "Is there clear executive accountability for gender equity and a proven ‘Preventative Duty’ regarding workplace safety?",
    levels: [
      { value: 1, label: "Foundational", text: "An executive is named as the EDI lead. A standard anti-harassment policy is in place." },
      { value: 2, label: "Developing", text: "Mandatory active anti-racism and anti-misogyny training is introduced for managers. Domestic abuse support is included in HR handbooks." },
      { value: 3, label: "Embedding", text: "Psychological safety is measured via anonymous surveys. ERGs (Employee Resource Groups) are in place and are consulted on policy co-design, including the formal establishment of a dedicated, funded 'Menopause Circle' or peer support network as an active subgroup. A zero-tolerance approach to microaggressions and the ‘Preventative Duty’ regarding harassment is role-modelled." },
      { value: 4, label: "Strategic", text: "Comprehensive women’s health retention plans (Menopause, Fertility, Pregnancy Loss) are active and include specialist coaching, supported by an active Menopause Workplace Risk Assessment Checklist integrated into Health & Safety workflows. Include a specific, mandatory annual module for line managers focusing on navigating conversations, understanding accommodations, and removing performance biases associated with menopause. The Executive Lead presents EDI progress to the Board quarterly with financial-grade rigour." },
      { value: 5, label: "Innovating", text: "ERGs are fully funded and have at least 10% formal ‘work time’ allocated for leaders. The organisation provides independent, third-party reporting lines for harassment and offers paid leave for domestic abuse survivors." }
    ]
  },
  {
    id: "frontline_progression",
    title: "Progression from Lower-Paid Roles",
    question: "Do you have clear pathways to management for women in frontline, operational, or lower-paid roles?",
    levels: [
      { value: 1, label: "Foundational", text: "Internal vacancies are posted on staff boards. All staff have development plans in place and regular 121’s, additional training is available upon request." },
      { value: 2, label: "Developing", text: "Visual career maps show pathways from entry-level to management. Training is held during core hours and outside school holidays to support those with caring duties." },
      { value: 3, label: "Embedding", text: "Degree requirements are removed from internal roles to support social mobility. The organisation budgets for ‘hidden costs’ (childcare/travel) to allow lower-paid staff and new employees to attend training and induction." },
      { value: 4, label: "Strategic", text: "Digital literacy pathways are funded for frontline staff. Junior Sponsorship Circles’ pair operational staff with senior leaders for advocacy, backed by a structural policy to automatically consider all eligible frontline staff for promotion to eliminate self-nomination barriers. Junior roles are redesigned to attract men into entry roles, balancing occupational segregation. Long term impactful programmes of development are in place for internal women to equitably progress." },
      { value: 5, label: "Innovating", text: "Social mobility is benchmarked using parental occupation data. 1-to-1 coaching is provided to all women, including ‘cultural capital’ coaching for women from working-class backgrounds to support their progression into leadership." }
    ]
  },
  {
    id: "intersectional_pay_gap",
    title: "Closing the Intersectional Pay Gap",
    question: "Are you transparent about pay and committed to closing intersectional pay and pension gaps?",
    layout: "grid-3",
    levels: [
      { value: 1, label: "Foundational", text: "Statutory Gender Pay Gap reporting is completed. Basic equal pay audits are conducted." },
      { value: 2, label: "Developing", text: "Salary bands are published internally. The organisation is an accredited Real Living Wage employer for all staff and contractors." },
      { value: 3, label: "Embedding", text: "Voluntary reporting on Ethnicity and Disability pay gaps. All job adverts must state specific flexible working options, available leave policies (e.g., enhanced parental/caring leave), and a clear salary range (no ‘competitive’ labels)." },
      { value: 4, label: "Strategic", text: "Fixed starting salaries are implemented to remove the ‘negotiation penalty’. Full employer pension contributions are maintained during the entire duration of all forms of parental leave." },
      { value: 5, label: "Innovating", text: "The organisation provides financial management training and support and publishes a time-bound ‘Wealth Equity’ plan. This addresses the ‘motherhood penalty’ and the pension gap, assessing the total financial health and long-term security of female employees." }
    ]
  },
  {
    id: "bias_free_recruitment",
    title: "Bias-Free Recruitment & Appraisals",
    question: "Are your recruitment and performance systems designed to be neuro-inclusive and free from systemic bias?",
    layout: "grid-3",
    levels: [
      { value: 1, label: "Foundational", text: "Hiring managers take annual ‘Unconscious Bias’ training modules." },
      { value: 2, label: "Developing", text: "Job ads are audited for gendered language. Blind-screening (removing names/universities) is used for all initial CV screening." },
      { value: 3, label: "Embedding", text: "Interview questions and panel details are shared 48 hours in advance as a default (Neuro-inclusion). ‘Cultural fit’ scores are replaced with objective, evidence-based rubrics with transparency and decision record keeping." },
      { value: 4, label: "Strategic", text: "Full-funnel data is audited (from application to offer) to identify where marginalised groups ‘leak’ from the process. Recruitment imagery proactively targets intersectional groups and women over 45." },
      { value: 5, label: "Innovating", text: "AI and peer-audits of performance appraisal language are conducted to ensure objective feedback. All HR systems are fully trans-inclusive and neuro-inclusive by design." }
    ]
  },
  {
    id: "sponsorship_networks",
    title: "Mentoring, Sponsorship & Networks",
    question: "Do you provide women with the social capital and networking opportunities needed to thrive?",
    layout: "grid-3",
    levels: [
      { value: 1, label: "Foundational", text: "A women’s network exists and holds occasional social or networking events during working hours." },
      { value: 2, label: "Developing", text: "A formal mentoring programme matches junior staff with senior colleagues. Events are held during core working hours and equitably consider the participation of hybrid and part time staff." },
      { value: 3, label: "Embedding", text: "Women’s Network leadership is intersectional (includes Global Majority and Disabled voices - including involvement of external experts if required to bridge any gaps). A dedicated budget is allocated for external coaching for underrepresented women." },
      { value: 4, label: "Strategic", text: "Intentional Reverse Mentoring is mandatory for senior leadership. The organisation uses its supply chain influence, requiring contractors to meet WiBC standards to win tenders." },
      { value: 5, label: "Innovating", text: "The organisation acts as a ‘Sector Leader’, publicly sharing EDI failures and learnings. It has established hiring pipelines with grassroots groups and local experts (e.g. disabled women or care leavers) to support the most marginalised women." }
    ]
  }
];

// Steps: 
// 0: Contact Details
// 1: Organisation Profile
// 2: Organisation Metrics + Logo
// 3: Payment
// 4: Intro
// 5 to 11: Goals 1 to 7
const TOTAL_STEPS = GOALS.length + 5; 

export default function AssessmentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animPhase, setAnimPhase] = useState<"enter" | "exit">("enter");
  const [animKey, setAnimKey] = useState(0);

  const [scores, setScores] = useState<Record<string, number>>(
    GOALS.reduce((acc, goal) => ({ ...acc, [goal.id]: 0 }), {})
  );

  // Form State
  const [onboarding, setOnboarding] = useState({
    // Step 1: Contact Details
    firstName: "",
    lastName: "",
    jobTitle: "",
    email: "",
    isPrimaryContact: true,
    alternativeContacts: [] as { firstName: string; lastName: string; companyName: string; jobTitle: string; email: string }[],

    // Step 2: Organisation Profile
    companyName: "",
    physicalAddress: "",
    industrySector: "",
    description: "",

    // Step 3: Metrics & Logo
    totalHeadcount: "",
    totalFte: "",
    workforceFemale: "",
    workforceMale: "",
    workforceNonBinary: "",

    // Quartiles
    quartileLowerFemale: "",
    quartileLowerMale: "",
    quartileLowerNonBinary: "",
    
    quartileLowerMiddleFemale: "",
    quartileLowerMiddleMale: "",
    quartileLowerMiddleNonBinary: "",

    quartileUpperMiddleFemale: "",
    quartileUpperMiddleMale: "",
    quartileUpperMiddleNonBinary: "",

    quartileUpperFemale: "",
    quartileUpperMale: "",
    quartileUpperNonBinary: "",

    logoPreview: ""
  });

  const [onboardingErrors, setOnboardingErrors] = useState<Record<string, string>>({});

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: ""
  });
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [isPaying, setIsPaying] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isRedirectingToStripe, setIsRedirectingToStripe] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("session_id")) {
        const savedDraft = localStorage.getItem("wibc_onboarding_draft");
        if (savedDraft) {
          try {
            setOnboarding(JSON.parse(savedDraft));
          } catch (e) {
            console.error("Failed to parse onboarding draft", e);
          }
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        setStep(4);
        setAnimPhase("enter");
      }
    }
  }, []);

  const handleStripeCheckout = async () => {
    setIsRedirectingToStripe(true);
    setSubmitError("");
    
    // Save state to localStorage before leaving
    localStorage.setItem("wibc_onboarding_draft", JSON.stringify(onboarding));

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: onboarding.email }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setSubmitError(data.error || "Failed to create checkout session");
        setIsRedirectingToStripe(false);
      }
    } catch (e) {
      setSubmitError("Network error. Please try again.");
      setIsRedirectingToStripe(false);
    }
  };

  const navigate = (newStep: number, dir: "next" | "prev") => {
    setDirection(dir);
    setAnimPhase("exit");
    setTimeout(() => {
      setStep(newStep);
      setAnimPhase("enter");
      setAnimKey(k => k + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  const handleNext = () => {
    if (animPhase !== "enter") return;

    if (step === 0) {
      if (!validateContactDetails()) return;
      navigate(1, "next");
    } else if (step === 1) {
      if (!validateOrganisationProfile()) return;
      navigate(2, "next");
    } else if (step === 2) {
      if (!validateOrganisationMetrics()) return;
      navigate(3, "next");
    } else if (step === 3) {
      handleStripeCheckout();
    } else if (step === 4) {
      navigate(5, "next");
    } else if (step >= 5 && step < TOTAL_STEPS - 1) {
      navigate(step + 1, "next");
    } else if (step === TOTAL_STEPS - 1) {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step > 0 && animPhase === "enter") {
      navigate(step - 1, "prev");
    }
  };

  const handleScoreChange = (goalId: string, value: number) => {
    setScores(prev => ({ ...prev, [goalId]: value }));
  };

  const isCurrentStepValid = () => {
    if (step === 0) {
      return onboarding.firstName && onboarding.lastName && onboarding.companyName && onboarding.jobTitle && onboarding.email;
    }
    if (step === 1) {
      return onboarding.companyName && onboarding.physicalAddress && onboarding.industrySector && onboarding.description;
    }
    if (step === 2) {
      return onboarding.totalHeadcount && onboarding.totalFte && onboarding.workforceFemale && onboarding.workforceMale;
    }
    if (step === 3) {
      return paymentData.cardName && paymentData.cardNumber && paymentData.cardExpiry && paymentData.cardCvc;
    }
    if (step === 4) return true;
    const goalIndex = step - 5;
    if (goalIndex >= 0 && goalIndex < GOALS.length) {
      return scores[GOALS[goalIndex].id] > 0;
    }
    return false;
  };

  // Onboarding Change Helper
  const handleOnboardingChange = (key: string, value: any) => {
    setOnboarding(prev => ({ ...prev, [key]: value }));
    if (onboardingErrors[key]) {
      setOnboardingErrors(prev => ({ ...prev, [key]: "" }));
    }
  };

  // Alternative Contacts
  const addAltContact = () => {
    setOnboarding(prev => ({
      ...prev,
      alternativeContacts: [...prev.alternativeContacts, { firstName: "", lastName: "", companyName: "", jobTitle: "", email: "" }]
    }));
  };

  const removeAltContact = (index: number) => {
    setOnboarding(prev => ({
      ...prev,
      alternativeContacts: prev.alternativeContacts.filter((_, i) => i !== index)
    }));
  };

  const handleAltContactChange = (index: number, key: "firstName" | "lastName" | "companyName" | "jobTitle" | "email", value: string) => {
    setOnboarding(prev => {
      const contacts = [...prev.alternativeContacts];
      contacts[index] = { ...contacts[index], [key]: value };
      return { ...prev, alternativeContacts: contacts };
    });
  };

  // Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleOnboardingChange("logoPreview", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validations
  const validateContactDetails = () => {
    const errs: Record<string, string> = {};
    if (!onboarding.firstName.trim()) errs.firstName = "First name is required";
    if (!onboarding.lastName.trim()) errs.lastName = "Last name is required";
    if (!onboarding.companyName.trim()) errs.companyName = "Company is required";
    if (!onboarding.jobTitle.trim()) errs.jobTitle = "Job title is required";
    if (!/\S+@\S+\.\S+/.test(onboarding.email.trim())) errs.email = "Valid email is required";
    setOnboardingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateOrganisationProfile = () => {
    const errs: Record<string, string> = {};
    if (!onboarding.companyName.trim()) errs.companyName = "Organisation name is required";
    if (!onboarding.physicalAddress.trim()) errs.physicalAddress = "Physical address is required";
    if (!onboarding.industrySector) errs.industrySector = "Please select industry sector classification";
    if (!onboarding.description.trim()) errs.description = "Brief description is required";
    setOnboardingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateOrganisationMetrics = () => {
    const errs: Record<string, string> = {};
    if (!onboarding.totalHeadcount) errs.totalHeadcount = "Total headcount is required";
    if (!onboarding.totalFte) errs.totalFte = "Total FTE is required";
    if (!onboarding.workforceFemale || !onboarding.workforceMale) {
      errs.composition = "Workforce female and male percentages are required";
    }
    setOnboardingErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs: Record<string, string> = {};
    if (!paymentData.cardName.trim()) errs.cardName = "Cardholder name is required";
    if (paymentData.cardNumber.replace(/\s/g, "").length < 16) errs.cardNumber = "Valid 16-digit card number required";
    if (!/^\d{2}\/\d{2}$/.test(paymentData.cardExpiry)) errs.cardExpiry = "Expiry must be MM/YY";
    if (paymentData.cardCvc.replace(/\D/g, "").length < 3) errs.cardCvc = "CVC is required";
    setPaymentErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const headcountNum = parseInt(onboarding.totalHeadcount) || 0;
      let companySizeStr = "1–10";
      if (headcountNum > 250) companySizeStr = "251+";
      else if (headcountNum > 50) companySizeStr = "51–250";
      else if (headcountNum > 10) companySizeStr = "11–50";

      const res = await fetch("/api/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: onboarding.companyName,
          contact_name: `${onboarding.firstName} ${onboarding.lastName}`,
          contact_email: onboarding.email,
          company_size: companySizeStr,
          industry_sector: onboarding.industrySector,
          
          job_title: onboarding.jobTitle,
          is_primary_contact: onboarding.isPrimaryContact,
          alternative_contacts: onboarding.alternativeContacts,
          physical_address: onboarding.physicalAddress,
          description: onboarding.description,
          logo_url: onboarding.logoPreview,
          
          total_headcount: headcountNum,
          total_fte: parseFloat(onboarding.totalFte) || null,
          workforce_female: parseFloat(onboarding.workforceFemale) || null,
          workforce_male: parseFloat(onboarding.workforceMale) || null,
          workforce_non_binary: parseFloat(onboarding.workforceNonBinary) || null,
          
          quartile_lower_female: parseFloat(onboarding.quartileLowerFemale) || null,
          quartile_lower_male: parseFloat(onboarding.quartileLowerMale) || null,
          quartile_lower_non_binary: parseFloat(onboarding.quartileLowerNonBinary) || null,
          quartile_lower_middle_female: parseFloat(onboarding.quartileLowerMiddleFemale) || null,
          quartile_lower_middle_male: parseFloat(onboarding.quartileLowerMiddleMale) || null,
          quartile_lower_middle_non_binary: parseFloat(onboarding.quartileLowerMiddleNonBinary) || null,
          quartile_upper_middle_female: parseFloat(onboarding.quartileUpperMiddleFemale) || null,
          quartile_upper_middle_male: parseFloat(onboarding.quartileUpperMiddleMale) || null,
          quartile_upper_middle_non_binary: parseFloat(onboarding.quartileUpperMiddleNonBinary) || null,
          quartile_upper_female: parseFloat(onboarding.quartileUpperFemale) || null,
          quartile_upper_male: parseFloat(onboarding.quartileUpperMale) || null,
          quartile_upper_non_binary: parseFloat(onboarding.quartileUpperNonBinary) || null,
          
          scores
        })
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
    if (step < 5) return null;
    const adjustedStep = step - 5;
    const totalProgressSteps = GOALS.length;
    const pct = Math.round(((adjustedStep + 1) / totalProgressSteps) * 100);
    return (
      <div className="progress-wrapper">
        <div className="progress-meta">
          <span className="progress-label">{adjustedStep < GOALS.length ? `Goal ${adjustedStep + 1} of ${GOALS.length}` : "Completed"}</span>
          <span className="progress-pct">{pct}% complete</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      </div>
    );
  };

  const renderOnboardingStep1 = () => (
    <div className="card onboarding-card" style={{ maxWidth: "700px", margin: "0 auto", padding: "2.5rem" }}>
      <div className="intake-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "2.5rem", color: "#000000", marginBottom: "0.5rem" }}>Contact Details</h2>
        <p style={{ fontSize: "0.95rem", color: "#000000" }}>
          Please provide your contact details.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              className="form-input"
              style={{ border: "1px solid #FFBB2B" }}
              value={onboarding.firstName}
              onChange={e => handleOnboardingChange("firstName", e.target.value)}
              placeholder="e.g. Jane"
            />
            {onboardingErrors.firstName && <p className="form-error">{onboardingErrors.firstName}</p>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              className="form-input"
              style={{ border: "1px solid #FFBB2B" }}
              value={onboarding.lastName}
              onChange={e => handleOnboardingChange("lastName", e.target.value)}
              placeholder="e.g. Smith"
            />
            {onboardingErrors.lastName && <p className="form-error">{onboardingErrors.lastName}</p>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="company">Company</label>
            <input
              type="text"
              id="company"
              className="form-input"
              style={{ border: "1px solid #FFBB2B" }}
              value={onboarding.companyName}
              onChange={e => handleOnboardingChange("companyName", e.target.value)}
              placeholder="e.g. Acme Corp"
            />
            {onboardingErrors.companyName && <p className="form-error">{onboardingErrors.companyName}</p>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="jobTitle">Position/job title</label>
            <input
              type="text"
              id="jobTitle"
              className="form-input"
              style={{ border: "1px solid #FFBB2B" }}
              value={onboarding.jobTitle}
              onChange={e => handleOnboardingChange("jobTitle", e.target.value)}
              placeholder="e.g. HR Director"
            />
            {onboardingErrors.jobTitle && <p className="form-error">{onboardingErrors.jobTitle}</p>}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="email">Email adress</label>
          <input
            type="email"
            id="email"
            className="form-input"
            style={{ border: "1px solid #FFBB2B" }}
            value={onboarding.email}
            onChange={e => handleOnboardingChange("email", e.target.value)}
            placeholder="e.g. jane.smith@organisation.com"
          />
          {onboardingErrors.email && <p className="form-error">{onboardingErrors.email}</p>}
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ marginBottom: "0.5rem" }}>Is this person the Primary Contact for Charter communications?</label>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              className={`btn ${onboarding.isPrimaryContact ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "0.5rem 1.5rem", fontSize: "0.875rem" }}
              onClick={() => handleOnboardingChange("isPrimaryContact", true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`btn ${!onboarding.isPrimaryContact ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "0.5rem 1.5rem", fontSize: "0.875rem" }}
              onClick={() => handleOnboardingChange("isPrimaryContact", false)}
            >
              No
            </button>
          </div>
        </div>

        {/* Alternative Contacts */}
        <div style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid var(--color-border-light)", marginBottom: onboarding.alternativeContacts.length > 0 ? "1.5rem" : "0" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#000000" }}>Alternative/Additional Contacts</h3>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Optional additional team members</p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", display: "flex", gap: "0.375rem", alignItems: "center" }}
              onClick={addAltContact}
            >
              <Plus size={16} /> Add Contact
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {onboarding.alternativeContacts.map((contact, idx) => (
              <div key={idx} className="alt-contact-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "#ffffff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#000000" }}>Contact {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeAltContact(idx)}
                    style={{ background: "none", border: "none", color: "var(--color-error)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.85rem", fontWeight: 500 }}
                    aria-label="Remove Contact"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-input" style={{ border: "1px solid #FFBB2B" }} value={contact.firstName} onChange={e => handleAltContactChange(idx, "firstName", e.target.value)} placeholder="e.g. Jane" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Last name</label>
                    <input type="text" className="form-input" style={{ border: "1px solid #FFBB2B" }} value={contact.lastName} onChange={e => handleAltContactChange(idx, "lastName", e.target.value)} placeholder="e.g. Smith" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company</label>
                    <input type="text" className="form-input" style={{ border: "1px solid #FFBB2B" }} value={contact.companyName} onChange={e => handleAltContactChange(idx, "companyName", e.target.value)} placeholder="e.g. Acme Corp" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Position/job title</label>
                    <input type="text" className="form-input" style={{ border: "1px solid #FFBB2B" }} value={contact.jobTitle} onChange={e => handleAltContactChange(idx, "jobTitle", e.target.value)} placeholder="e.g. HR Director" />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email adress</label>
                  <input type="email" className="form-input" style={{ border: "1px solid #FFBB2B" }} value={contact.email} onChange={e => handleAltContactChange(idx, "email", e.target.value)} placeholder="e.g. jane.smith@organisation.com" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-nav" style={{ marginTop: "1rem" }}>
          <div />
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const renderOnboardingStep2 = () => (
    <div className="card onboarding-card" style={{ maxWidth: "700px", margin: "0 auto", padding: "2.5rem" }}>
      <div className="intake-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "2.5rem", color: "#000000", marginBottom: "0.5rem" }}>Organisation Profile</h2>
        <p style={{ fontSize: "0.95rem", color: "#000000" }}>
          Please provide your organisation details.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="form-group">
          <label className="form-label" htmlFor="companyName">Name of Business / Organisation</label>
          <input
            type="text"
            id="companyName"
            className="form-input"
            style={{ border: "1px solid #FFBB2B" }}
            value={onboarding.companyName}
            onChange={e => handleOnboardingChange("companyName", e.target.value)}
            placeholder="e.g. Bristol Tech Solutions"
          />
          {onboardingErrors.companyName && <p className="form-error">{onboardingErrors.companyName}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="physicalAddress">Physical Business Address (Headquarters / Regional Office)</label>
          <input
            type="text"
            id="physicalAddress"
            className="form-input"
            style={{ border: "1px solid #FFBB2B" }}
            value={onboarding.physicalAddress}
            onChange={e => handleOnboardingChange("physicalAddress", e.target.value)}
            placeholder="e.g. 10 Temple Way, Bristol, BS2 0BY"
          />
          {onboardingErrors.physicalAddress && <p className="form-error">{onboardingErrors.physicalAddress}</p>}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="industrySector">Sector / Industry Classification</label>
            <select
              id="industrySector"
              className="form-select"
              style={{ border: "1px solid #FFBB2B" }}
              value={onboarding.industrySector}
              onChange={e => handleOnboardingChange("industrySector", e.target.value)}
            >
              <option value="">Select industry classification...</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Tech">Tech / Information & Communication</option>
              <option value="Manufacturing">Manufacturing & Engineering</option>
              <option value="Healthcare">Healthcare & Life Sciences</option>
              <option value="Education">Education & Academies</option>
              <option value="Construction">Construction & Real Estate</option>
              <option value="Finance">Financial & Insurance Services</option>
              <option value="Retail">Retail & Consumer Goods</option>
              <option value="Public Sector">Public Sector & Government</option>
              <option value="Other">Other Services</option>
            </select>
            {onboardingErrors.industrySector && <p className="form-error">{onboardingErrors.industrySector}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Products & Services Description</label>
            <input
              type="text"
              id="description"
              className="form-input"
              style={{ border: "1px solid #FFBB2B" }}
              value={onboarding.description}
              onChange={e => handleOnboardingChange("description", e.target.value)}
              placeholder="e.g. Software products, consulting..."
            />
            {onboardingErrors.description && <p className="form-error">{onboardingErrors.description}</p>}
          </div>
        </div>

        <div className="form-nav" style={{ marginTop: "1rem" }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrev}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const renderOnboardingStep3 = () => (
    <div className="card onboarding-card" style={{ maxWidth: "700px", margin: "0 auto", padding: "2.5rem" }}>
      <div className="intake-header" style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "2.5rem", color: "#000000", marginBottom: "0.5rem" }}>Metrics & Logo</h2>
        <p style={{ fontSize: "0.95rem", color: "#000000" }}>
          Please provide your organisation metrics and corporate logo.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="totalHeadcount">Total Headcount</label>
            <input
              type="number"
              id="totalHeadcount"
              className="form-input"
              style={{ border: "1px solid #FFBB2B" }}
              value={onboarding.totalHeadcount}
              onChange={e => handleOnboardingChange("totalHeadcount", e.target.value)}
              placeholder="e.g. 120"
            />
            {onboardingErrors.totalHeadcount && <p className="form-error">{onboardingErrors.totalHeadcount}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="totalFte" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              Total FTE
              <span className="tooltip-container" style={{ color: "#666" }}>
                <Info size={14} />
                <span className="tooltip-text">
                  Full-Time Equivalent (FTE): The workload of one full-time employee. E.g., two part-time employees working 0.5 each equal 1.0 FTE.
                </span>
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              id="totalFte"
              className="form-input"
              style={{ border: "1px solid #FFBB2B" }}
              value={onboarding.totalFte}
              onChange={e => handleOnboardingChange("totalFte", e.target.value)}
              placeholder="e.g. 115.5"
            />
            {onboardingErrors.totalFte && <p className="form-error">{onboardingErrors.totalFte}</p>}
          </div>
        </div>

        {/* Gender Composition */}
        <div>
          <span className="form-label" style={{ marginBottom: "0.75rem", display: "block" }}>Workforce Gender Composition (%)</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>% Female</label>
              <input
                type="number"
                placeholder="%"
                className="form-input"
                style={{ border: "1px solid #FFBB2B" }}
                value={onboarding.workforceFemale}
                onChange={e => handleOnboardingChange("workforceFemale", e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>% Male</label>
              <input
                type="number"
                placeholder="%"
                className="form-input"
                style={{ border: "1px solid #FFBB2B" }}
                value={onboarding.workforceMale}
                onChange={e => handleOnboardingChange("workforceMale", e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>% Non-Binary</label>
              <input
                type="number"
                placeholder="%"
                className="form-input"
                style={{ border: "1px solid #FFBB2B" }}
                value={onboarding.workforceNonBinary}
                onChange={e => handleOnboardingChange("workforceNonBinary", e.target.value)}
              />
            </div>
          </div>
          {onboardingErrors.composition && <p className="form-error" style={{ marginTop: "0.5rem" }}>{onboardingErrors.composition}</p>}
        </div>

        {/* Pay Quartiles */}
        <div style={{ overflowX: "auto", marginTop: "1rem" }}>
          <span className="form-label" style={{ marginBottom: "0.75rem", display: "block" }}>Pay Quartile Gender Composition (%)</span>
          <table className="composition-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid var(--color-border)" }}>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Quartile</th>
                <th style={{ textAlign: "center", padding: "0.5rem", width: "75px" }}>% F</th>
                <th style={{ textAlign: "center", padding: "0.5rem", width: "75px" }}>% M</th>
                <th style={{ textAlign: "center", padding: "0.5rem", width: "75px" }}>% NB</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                <td style={{ padding: "0.5rem" }}><strong>Lower Quartile (0-25%)</strong></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileLowerFemale} onChange={e => handleOnboardingChange("quartileLowerFemale", e.target.value)} /></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileLowerMale} onChange={e => handleOnboardingChange("quartileLowerMale", e.target.value)} /></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileLowerNonBinary} onChange={e => handleOnboardingChange("quartileLowerNonBinary", e.target.value)} /></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                <td style={{ padding: "0.5rem" }}><strong>Lower Middle (25-50%)</strong></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileLowerMiddleFemale} onChange={e => handleOnboardingChange("quartileLowerMiddleFemale", e.target.value)} /></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileLowerMiddleMale} onChange={e => handleOnboardingChange("quartileLowerMiddleMale", e.target.value)} /></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileLowerMiddleNonBinary} onChange={e => handleOnboardingChange("quartileLowerMiddleNonBinary", e.target.value)} /></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                <td style={{ padding: "0.5rem" }}><strong>Upper Middle (50-75%)</strong></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileUpperMiddleFemale} onChange={e => handleOnboardingChange("quartileUpperMiddleFemale", e.target.value)} /></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileUpperMiddleMale} onChange={e => handleOnboardingChange("quartileUpperMiddleMale", e.target.value)} /></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileUpperMiddleNonBinary} onChange={e => handleOnboardingChange("quartileUpperMiddleNonBinary", e.target.value)} /></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--color-border-light)" }}>
                <td style={{ padding: "0.5rem" }}><strong>Upper Quartile (75-100%)</strong></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileUpperFemale} onChange={e => handleOnboardingChange("quartileUpperFemale", e.target.value)} /></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileUpperMale} onChange={e => handleOnboardingChange("quartileUpperMale", e.target.value)} /></td>
                <td style={{ padding: "0 4px" }}><input type="number" className="form-input text-center" style={{ padding: "0.25rem", border: "1px solid #FFBB2B" }} value={onboarding.quartileUpperNonBinary} onChange={e => handleOnboardingChange("quartileUpperNonBinary", e.target.value)} /></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Logo Upload */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {onboarding.logoPreview ? (
            <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", padding: "1.25rem", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface-2)" }}>
              <div style={{ width: "80px", height: "80px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem", backgroundColor: "#fff" }}>
                <img src={onboarding.logoPreview} alt="Logo preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--color-text)", margin: 0 }}>Logo Uploaded</p>
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0.25rem 0 0" }}>Your corporate logo is ready for the Charter.</p>
              </div>
              <button
                type="button"
                onClick={() => handleOnboardingChange("logoPreview", "")}
                className="btn btn-secondary"
                style={{ padding: "0.5rem 1rem", color: "var(--color-error)", display: "flex", alignItems: "center", gap: "0.5rem", borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <Trash2 size={16} /> Remove
              </button>
            </div>
          ) : (
            <div style={{ border: "2px dashed var(--color-border)", borderRadius: "var(--radius-md)", padding: "1.25rem", textAlign: "center", position: "relative", backgroundColor: "var(--color-surface-2)" }}>
              <input
                type="file"
                accept="image/png, image/svg+xml, image/jpeg, image/jpg"
                onChange={handleLogoUpload}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
              />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <Upload size={20} className="text-muted" style={{ pointerEvents: "none" }} />
                <span className="text-muted" style={{ fontSize: "0.85rem", pointerEvents: "none" }}>Click to select corporate logo</span>
              </div>
            </div>
          )}
          <p className="text-muted" style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem", lineHeight: "1.4" }}>
            Upon completion of the GED you will become a ‘supporter’ of the charter, please upload your logo so that we can display it on our website
          </p>
        </div>

        <div className="form-nav" style={{ marginTop: "1rem" }}>
          <button type="button" className="btn btn-secondary" onClick={handlePrev}>
            Back
          </button>
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="card payment-card" style={{ maxWidth: "560px", margin: "0 auto", padding: "3rem" }}>
      <div className="intake-header" style={{ textAlign: "center", marginBottom: "2rem", borderBottom: "none", paddingBottom: 0 }}>
        <h2 style={{ fontSize: "2.5rem", color: "#000000", marginBottom: "0.5rem" }}>Confirm Contribution</h2>
        <p style={{ fontSize: "0.95rem", color: "#000000" }}>
          A contribution of <strong>£150</strong> is required to support the charter and access the gender equity analysis tool.
        </p>
      </div>

      <div style={{ background: "var(--color-bg)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1.5px solid #FFBB2B", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <span style={{ fontWeight: 700, display: "block", fontSize: "1rem" }}>WiBC Supporter Subscription</span>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Includes diagnostic reporting & directory listing</span>
        </div>
        <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-primary)" }}>£150.00</span>
      </div>

      <form onSubmit={e => { e.preventDefault(); handleStripeCheckout(); }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.8rem", margin: "1.5rem 0" }}>
          <span>🔒 Secured via Stripe gateway</span>
        </div>
        
        {submitError && (
          <div className="error-banner" style={{ marginBottom: "1rem" }}>
            <AlertCircle size={20} />
            <span>{submitError}</span>
          </div>
        )}

        <div className="form-nav" style={{ marginTop: "2rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={isPaying}
          >
            Back
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isRedirectingToStripe}
            style={{ minWidth: "160px", justifyContent: "center", backgroundColor: "var(--color-primary)", color: "white" }}
          >
            {isRedirectingToStripe ? (
              <>
                <Loader2 size={16} aria-hidden="true" style={{ animation: "spin 0.8s linear infinite" }} />
                Redirecting to Stripe...
              </>
            ) : (
              "Proceed to Payment via Stripe"
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderIntroStep = () => (
    <div className="card intro-card" style={{ textAlign: "center", padding: "4rem 3rem", maxWidth: "884px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "center" }}>
        <img src="/step1-icon.svg" alt="Building icon" style={{ width: "72px", height: "72px", borderRadius: "50%" }} />
      </div>
      <h1 style={{ marginBottom: "1rem", fontSize: "2.5rem" }}>Gender Equity Diagnostic</h1>
      <p style={{ fontSize: "16px", color: "var(--color-text)", maxWidth: "718px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
        Welcome to the West of England Women in Business Charter&apos;s Gender Equity Diagnostic. This tool helps you assess your organisation&apos;s maturity across 7 key goals related to gender equity in the workplace.
      </p>
      
      <div style={{ background: "var(--color-surface)", padding: "2rem", borderRadius: "var(--radius-md)", textAlign: "left", maxWidth: "718px", margin: "0 auto 2.5rem", border: "1px solid #FFBB2B" }}>
        <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem", color: "#000000" }}>
          How to take the assessment
        </h3>
        <ul style={{ paddingLeft: "1.5rem", color: "var(--color-text)", fontSize: "1rem", display: "flex", flexDirection: "column", gap: "8px", lineHeight: 1.6 }}>
          <li style={{ listStyleType: "disc" }}>You&apos;ll be asked a single maturity question across 7 key goals.</li>
          <li style={{ listStyleType: "disc" }}>For each goal, select the option that best reflects your current organisational practice. You&apos;ll have the opportunity for a more granular assessment once you&apos;ve run this initial diagnostic.</li>
          <li style={{ listStyleType: "disc" }}>The assessment takes approximately 5 minutes to complete.</li>
          <li style={{ listStyleType: "disc" }}>At the end, you&apos;ll receive a detailed maturity scorecard and recommended next steps.</li>
        </ul>
      </div>

      <div className="form-nav" style={{ justifyContent: "center", gap: "1rem" }}>
        <button className="btn btn-secondary" onClick={handlePrev}>Back</button>
        <button className="btn btn-primary" onClick={handleNext}>Start diagnostic</button>
      </div>
    </div>
  );

  const renderAssessmentStep = () => {
    const goalIndex = step - 5;
    const goal = GOALS[goalIndex];
    const currentScore = scores[goal.id];
    const isLastGoal = goalIndex === GOALS.length - 1;

    return (
      <div className="card">
        {/* Goal Header */}
        <div className="goal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "none", gap: "1.5rem" }}>
          <div>
            <div className="goal-badge">
              <span>Goal {goalIndex + 1} of {GOALS.length}</span>
            </div>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{goal.title}</h2>
            <p className="goal-question" style={{ fontSize: "1.125rem", fontStyle: "normal", color: "var(--color-text)", fontWeight: 500, margin: "0.75rem 0 0" }}>
              {goal.question}
            </p>
          </div>
          <img src="/step-image.png" alt="" style={{ width: "140px", height: "auto", flexShrink: 0 }} />
        </div>

        {/* Levels List */}
        <div className={`scale-grid ${goal.layout === "grid-3" ? "cols-3" : "cols-1"}`} role="group" aria-label={`Maturity options for ${goal.title}`}>
          {goal.levels.map((level) => {
            const isSelected = currentScore === level.value;
            const labelText = level.label.includes(':') ? level.label.split(':')[1].trim() : level.label;
            return (
              <button
                key={level.value}
                type="button"
                onClick={() => handleScoreChange(goal.id, level.value)}
                aria-pressed={isSelected}
                className={`scale-button ${isSelected ? "selected" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <div className="scale-num">{level.value}</div>
                  <div className="scale-label-text">{labelText}</div>
                </div>
                <div className="scale-desc-text">{level.text}</div>
              </button>
            );
          })}
        </div>

        {submitError && (
          <div className="error-banner" role="alert" style={{ marginTop: "2rem" }}>
            <AlertCircle size={16} aria-hidden="true" /> {submitError}
          </div>
        )}

        {/* Navigation */}
        <div className="form-nav" style={{ marginTop: "2rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={isSubmitting}
          >
            Back
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
            disabled={!isCurrentStepValid() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} aria-hidden="true" style={{ animation: "spin 0.8s linear infinite" }} />
                Submitting...
              </>
            ) : isLastGoal ? (
              "Submit Diagnostic"
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    );
  };

  const useWaitlistBg = step >= 0 && step <= 3;

  return (
    <div 
      className={`page-wrapper ${step === 4 ? 'step-intro' : ''}`} 
      style={{ 
        minHeight: 'calc(100vh - 73px)', 
        display: 'flex',
        flexDirection: 'column',
        ...(useWaitlistBg ? {
          backgroundImage: 'url("/background-waitlist.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        } : step === 4 ? {
          backgroundImage: 'url("/background.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        } : {
          backgroundColor: '#FFEDB8'
        })
      }}
    >
      <div className="container" style={{ paddingTop: (step === 4 || useWaitlistBg) ? "4rem" : "2.5rem", flex: 1 }}>
        {renderProgressBar()}
        <div
          key={animPhase === "exit" ? "exiting" : animKey}
          className={
            animPhase === "exit"
              ? (direction === "next" ? "step-exit-next" : "step-exit-prev")
              : (direction === "next" ? "step-enter-next" : "step-enter-prev")
          }
        >
          {step === 0 && renderOnboardingStep1()}
          {step === 1 && renderOnboardingStep2()}
          {step === 2 && renderOnboardingStep3()}
          {step === 3 && renderPaymentStep()}
          {step === 4 && renderIntroStep()}
          {step >= 5 && step < TOTAL_STEPS && renderAssessmentStep()}
        </div>
      </div>
    </div>
  );
}
