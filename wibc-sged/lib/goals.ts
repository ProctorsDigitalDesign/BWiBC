export interface GoalLevel {
  value: number;
  label: string;
  text: string;
  guide?: string;
}

export interface Goal {
  id: string;
  title: string;
  question: string;
  layout?: string;
  levels: GoalLevel[];
}

export const GOALS: Goal[] = [
  {
    id: "flexible_working",
    title: "Flexible & part-time working",
    question: "Promote and make available flexible and part-time working, especially in senior level roles that attract higher levels of pay and conditions",
    layout: "grid-3",
    levels: [
      { value: 1, label: "Foundational", text: "A 'Ways of Working' policy exists including flexible working and hybrid working standards. Formal Flexible Working Requests are handled on a case-by-case basis as per statutory law.", guide: "• Establish a 'Ways of Working' policy including hybrid standards.\n• Handle formal Flexible Working Requests proactively." },
      { value: 2, label: "Developing", text: "Flexibility and available options are proactively mentioned in all job adverts. Senior leaders work hybrid or part-time and are visible role models.", guide: "• Proactively mention flexibility and available options in all job adverts.\n• Ensure senior leaders role-model hybrid or part-time work." },
      { value: 3, label: "Embedding", text: "A 'Flexible by Default' culture is adopted; the business must prove a role cannot be flexible rather than the employee proving it can. Disability-related flexibility is an accepted 'Reasonable Adjustment'. Support for menopause and menstrual health is formalised.", guide: "• Adopt a 'Flexible by Default' culture where the business must prove a role cannot be flexible.\n• Accept disability-related flexibility as a 'Reasonable Adjustment'.\n• Formalise support for menopause and menstrual health." },
      { value: 4, label: "Strategic", text: "Managers are trained in output-based performance (results over 'presenteeism'). High-spec hardware and ergonomic tools are provided to all remote/hybrid staff. Equitable employee comms, engagement and networking opportunities are guaranteed regardless of location or hours worked.", guide: "• Train managers in output-based performance (results over 'presenteeism').\n• Provide high-spec hardware and ergonomic tools to remote/hybrid staff.\n• Guarantee equitable comms, engagement, and networking regardless of location/hours." },
      { value: 5, label: "Innovating", text: "A market-leading approach to ways of working (e.g. 4-day week / 9 day fortnight) is in place. A 'Right to Disconnect' is contractually enforced, protecting employees from 'always-on' culture and burnout. Intersectional uptake data is reviewed monthly by the Board.", guide: "• Implement a market-leading approach to ways of working (e.g. 4-day week or 9-day fortnight).\n• Contractually enforce a 'Right to Disconnect' to protect employees from burnout.\n• Review intersectional uptake data monthly at the Board level." }
    ]
  },
  {
    id: "senior_representation",
    title: "Representative senior leadership",
    question: "Increase the number of women at senior levels and on the board",
    layout: "grid-3",
    levels: [
      { value: 1, label: "Level 1 (Foundational)", text: "Gender representation is tracked at a high level. A basic commitment to diversity is included in your annual reporting.", guide: "• Track gender representation at a high level.\n• Include a basic commitment to diversity in your annual reporting." },
      { value: 2, label: "Developing", text: "The organisation sets internal gender targets. 'Stay and develop interviews' are conducted with women in middle management to understand retention and support progression.", guide: "• Set internal gender targets.\n• Conduct 'Stay and develop interviews' with women in middle management to understand retention and support progression." },
      { value: 3, label: "Embedding", text: "Intersectional data is collected. Specific targets are set for women of all backgrounds (Race/Disability/Class/Sexuality) to be represented at all levels. Role profiles are audited to remove class-coded requirements (e.g. university bias).", guide: "• Collect intersectional data and set specific representation targets for women of all backgrounds.\n• Audit role profiles to remove class-coded requirements like university bias." },
      { value: 4, label: "Level 4 (Strategic)", text: "A formal 'Sponsorship' programme exists where C-suite leaders use their influence to include marginalised women's voices in high-level meetings and/or use reverse mentoring. Promotion and interview panels are always diverse, using external advisors where necessary.", guide: "• Create a formal 'Sponsorship' programme to include marginalised women's voices in high-level meetings and/or use reverse mentoring.\n• Ensure promotion and interview panels are diverse, using external advisors if necessary." },
      { value: 5, label: "Innovating", text: "Executive bonuses are directly linked to intersectional diversity outcomes. Radical transparency: External data dashboards measure the 'career velocity' and progression of different demographic groups to drive investment.", guide: "• Directly link executive bonuses to intersectional diversity outcomes.\n• Implement external data dashboards to measure the 'career velocity' of different demographic groups." }
    ]
  },
  {
    id: "executive_accountability",
    title: "Executive accountability & safe culture",
    question: "Make at least one member of the senior executive team responsible for reporting on gender equality and inclusion",
    levels: [
      { value: 1, label: "Foundational", text: "An executive is named as the equity and inclusion lead. A standard anti-harassment policy is in place.", guide: "• Name an executive as the equity and inclusion lead.\n• Establish a standard anti-harassment policy." },
      { value: 2, label: "Developing", text: "Mandatory active anti-racism and anti-misogyny training is introduced for managers. Domestic abuse support is included in HR handbooks.", guide: "• Introduce mandatory active anti-racism and anti-misogyny training for managers.\n• Include domestic abuse support in HR handbooks." },
      { value: 3, label: "Embedding", text: "Psychological safety is measured via anonymous surveys. ERGs (Employee Resource Groups) are in place and are consulted on policy co-design, including the formal establishment of a dedicated, funded 'Menopause Circle' or peer support network as an active subgroup. A zero-tolerance approach to microaggressions and the 'Preventative Duty' regarding harassment is role-modelled.", guide: "• Measure psychological safety via anonymous surveys.\n• Consult Employee Resource Groups (ERGs) on policy co-design and establish a funded 'Menopause Circle'.\n• Role-model a zero-tolerance approach to microaggressions." },
      { value: 4, label: "Strategic", text: "Comprehensive women's health retention plans (Menopause, Fertility, Pregnancy Loss) are active and include specialist coaching, supported by an active Menopause Workplace Risk Assessment Checklist integrated into Health & Safety workflows. Include a specific, mandatory annual module for line managers focusing on navigating conversations, understanding accommodations, and removing performance biases associated with menopause. The Executive Lead presents EDI progress to the Board quarterly with financial-grade rigour.", guide: "• Activate comprehensive women's health retention plans with specialist coaching.\n• Integrate a Menopause Workplace Risk Assessment into Health & Safety workflows.\n• Deliver specific annual line manager training on removing performance biases.\n• Present EDI progress to the Board quarterly." },
      { value: 5, label: "Innovating", text: "ERGs are fully funded and have at least 10% formal 'work time' allocated for leaders. The organisation provides independent, third-party reporting lines for harassment and offers paid leave for domestic abuse survivors.", guide: "• Fully fund ERGs and allocate at least 10% formal 'work time' for leaders.\n• Provide independent, third-party reporting lines for harassment.\n• Offer paid leave for domestic abuse survivors." }
    ]
  },
  {
    id: "frontline_progression",
    title: "Progression from lower-paid roles",
    question: "Encourage and support female employees in lower paid and lower skilled occupations to progress through the business, through training and other on-going support",
    levels: [
      { value: 1, label: "Foundational", text: "Internal vacancies are posted on staff boards. All staff have development plans in place and regular 121's, additional training is available upon request.", guide: "• Post internal vacancies on staff boards.\n• Ensure all staff have development plans and regular 1-to-1s." },
      { value: 2, label: "Developing", text: "Visual career maps show pathways from entry-level to management. Training is held during core hours and outside school holidays to support those with caring duties.", guide: "• Create visual career maps showing pathways from entry-level to management.\n• Hold training during core hours and outside school holidays to support carers." },
      { value: 3, label: "Embedding", text: "Degree requirements are removed from internal roles to support social mobility. The organisation budgets for 'hidden costs' (childcare/travel) to allow lower-paid staff and new employees to attend training and induction.", guide: "• Remove degree requirements from internal roles to support social mobility.\n• Budget for 'hidden costs' (childcare/travel) so lower-paid staff can attend training." },
      { value: 4, label: "Strategic", text: "Digital literacy pathways are funded for frontline staff. 'Junior Sponsorship Circles' pair operational staff with senior leaders for advocacy, backed by a structural policy to automatically consider all eligible frontline staff for promotion to eliminate self-nomination barriers. Junior roles are redesigned to attract men into entry roles, balancing occupational segregation. Long term impactful programmes of development are in place for internal women to equitably progress.", guide: "• Fund digital literacy pathways for frontline staff.\n• Establish 'Junior Sponsorship Circles' pairing operational staff with senior leaders.\n• Redesign junior roles to balance occupational segregation and create long-term development programmes." },
      { value: 5, label: "Innovating", text: "Social mobility is benchmarked using parental occupation data. 1-to-1 coaching is provided to all women, including 'cultural capital' coaching for women from working-class backgrounds to support their progression into leadership.", guide: "• Benchmark social mobility using parental occupation data.\n• Provide 1-to-1 'cultural capital' coaching for women from working-class backgrounds to support their progression." }
    ]
  },
  {
    id: "intersectional_pay_gap",
    title: "Closing the intersectional pay gap",
    question: "Work towards closing the gender pay gap",
    layout: "grid-3",
    levels: [
      { value: 1, label: "Foundational", text: "Statutory Gender Pay Gap reporting is completed. Basic equal pay audits are conducted.", guide: "• Complete statutory Gender Pay Gap reporting.\n• Conduct basic equal pay audits." },
      { value: 2, label: "Developing", text: "Salary bands are published internally. The organisation is an accredited Real Living Wage employer for all staff and contractors.", guide: "• Publish salary bands internally.\n• Become an accredited Real Living Wage employer for all staff and contractors." },
      { value: 3, label: "Embedding", text: "Reporting is completed on Ethnicity and Disability pay gaps. All job adverts must state specific flexible working options, available leave policies (e.g., enhanced parental/caring leave), and a clear salary range (no 'competitive' labels).", guide: "• Report on Ethnicity and Disability pay gaps.\n• State specific flexible working options, available leave policies, and clear salary ranges on all job adverts." },
      { value: 4, label: "Strategic", text: "Fixed starting salaries are implemented to remove the 'negotiation penalty'. Full employer pension contributions are maintained during the entire duration of all forms of parental leave.", guide: "• Implement fixed starting salaries to remove the 'negotiation penalty'.\n• Maintain full employer pension contributions during all forms of parental leave." },
      { value: 5, label: "Innovating", text: "The organisation provides financial management training and support and publishes a time-bound 'Wealth Equity' plan. This addresses the 'motherhood penalty' and the pension gap, assessing the total financial health and long-term security of female employees.", guide: "• Provide financial management training.\n• Publish a time-bound 'Wealth Equity' plan to address the 'motherhood penalty' and pension gap." }
    ]
  },
  {
    id: "bias_free_recruitment",
    title: "Bias-free recruitment & appraisals",
    question: "Implement recruitment, appraisal, personal development and promotion processes that are non-discriminatory towards women and are free from unconscious bias",
    layout: "grid-3",
    levels: [
      { value: 1, label: "Foundational", text: "Hiring managers take annual 'Unconscious Bias' training modules.", guide: "• Ensure hiring managers take annual 'Unconscious Bias' training modules." },
      { value: 2, label: "Developing", text: "Job ads are audited for gendered language. Blind-screening (removing names/universities) is used for all initial CV screening.", guide: "• Audit job ads for gendered language.\n• Implement blind-screening for all initial CV screening." },
      { value: 3, label: "Embedding", text: "Interview questions and panel details are shared 48 hours in advance as a default (Neuro-inclusion). 'Cultural fit' scores are replaced with objective, evidence-based rubrics with transparency and decision record keeping.", guide: "• Share interview questions and panel details 48 hours in advance for neuro-inclusion.\n• Replace 'cultural fit' scores with objective, evidence-based rubrics." },
      { value: 4, label: "Strategic", text: "Full-funnel data is audited (from application to offer) to identify where marginalised groups 'leak' from the process. Recruitment imagery proactively targets intersectional groups and women over 45.", guide: "• Audit full-funnel data to identify where marginalised groups 'leak' from the process.\n• Use recruitment imagery that proactively targets intersectional groups and women over 45." },
      { value: 5, label: "Innovating", text: "AI and peer-audits of performance appraisal language are conducted to ensure objective feedback. All HR systems are fully trans-inclusive and neuro-inclusive by design.", guide: "• Conduct AI and peer-audits of performance appraisal language to ensure objective feedback.\n• Ensure all HR systems are fully trans-inclusive and neuro-inclusive." }
    ]
  },
  {
    id: "sponsorship_networks",
    title: "Mentoring, sponsorship & networks",
    question: "Support women where they are under-represented, through mentoring and women's networks",
    layout: "grid-3",
    levels: [
      { value: 1, label: "Foundational", text: "A women's network exists and holds occasional social or networking events during working hours.", guide: "• Establish a women's network that holds occasional events during working hours." },
      { value: 2, label: "Developing", text: "A formal mentoring programme matches junior staff with senior colleagues. Events are held during core working hours and equitably consider the participation of hybrid and part time staff.", guide: "• Match junior staff with senior colleagues through a formal mentoring programme.\n• Hold events during core working hours to include hybrid and part-time staff." },
      { value: 3, label: "Embedding", text: "Women's Network leadership is intersectional (includes Global Majority and Disabled voices - including involvement of external experts if required to bridge any gaps). A dedicated budget is allocated for external coaching for underrepresented women.", guide: "• Ensure Women's Network leadership is intersectional.\n• Allocate a dedicated budget for external coaching for underrepresented women." },
      { value: 4, label: "Strategic", text: "Intentional Reverse Mentoring is mandatory for senior leadership. The organisation uses its supply chain influence, requiring contractors to meet WiBC standards to win tenders.", guide: "• Make Intentional Reverse Mentoring mandatory for senior leadership.\n• Use supply chain influence by requiring contractors to meet WiBC standards." },
      { value: 5, label: "Innovating", text: "The organisation acts as a 'Sector Leader', publicly sharing EDI failures and learnings. It has established hiring pipelines with grassroots groups and local experts (e.g. disabled women or care leavers) to support the most marginalised women.", guide: "• Act as a 'Sector Leader' by publicly sharing EDI failures and learnings.\n• Establish hiring pipelines with grassroots groups to support the most marginalised women." }
    ]
  }
];
