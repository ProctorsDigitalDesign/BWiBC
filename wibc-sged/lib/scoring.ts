import type { MaturityBand } from './database.types'

export interface GoalScores {
  flexible_working: number
  senior_representation: number
  executive_accountability: number
  frontline_progression: number
  intersectional_pay_gap: number
  bias_free_recruitment: number
  sponsorship_networks: number
}

/**
 * Calculates the total score (0–35) from the 7 individual goal scores (0–5 each).
 */
export function calculateTotalScore(scores: GoalScores): number {
  return Object.values(scores).reduce((sum, v) => sum + v, 0)
}

/**
 * Maps a total score to the correct maturity band label.
 *
 *  0–10  → Emerging
 * 11–20  → Developing
 * 21–30  → Strategic
 * 31–35  → Innovating
 */
export function getMaturityBand(totalScore: number): MaturityBand {
  if (totalScore <= 10) return 'Emerging'
  if (totalScore <= 20) return 'Developing'
  if (totalScore < 30) return 'Strategic'
  return 'Innovating'
}

/**
 * Returns the procurement / signatory advice based on the maturity band.
 */
export function getProcurementAdvice(band: MaturityBand): string {
  const advice: Record<MaturityBand, string> = {
    Emerging:
      "To improve your maturity, focus on moving beyond basic compliance by establishing formal commitments and proactive equity policies. Joining the WiBC can provide the framework to help you progress.",
    Developing:
      "You are making great progress in embedding inclusive practices. We invite you to join the WiBC as a 'Supporter' or 'Signatory' to access peer-learning and structured support to reach the next level.",
    Strategic:
      "Outstanding work! Your strong alignment with gender equity values positions you as a highly attractive partner for procurement teams. Consider becoming a full WiBC Signatory to publicly showcase your commitment.",
    Innovating:
      "Exceptional! Your organisation is a true sector leader. We invite you to partner with WiBC to co-author best practice guides, share your insights, and mentor other businesses in the region.",
  }
  return advice[band]
}

/**
 * Returns a short description of the maturity band for display in the scorecard.
 */
export function getBandDescription(band: MaturityBand): string {
  const descriptions: Record<MaturityBand, string> = {
    Emerging:
      'Your organisation meets basic legal requirements but lacks a proactive gender equity strategy.',
    Developing:
      "Your organisation is actively working to embed inclusive practices and develop an intersectional focus.",
    Strategic:
      'Your organisation has strongly embedded gender equity practices and policies across the business.',
    Innovating:
      'Your organisation is a true sector leader, setting new standards for equity, transparency, and inclusive culture.',
  }
  return descriptions[band]
}

/**
 * Maps a 1–5 goal score to the corresponding maturity level label.
 */
export function getGoalMaturityLabel(score: number): string {
  const labels: Record<number, string> = {
    0: 'Not Assessed',
    1: 'Foundational',
    2: 'Developing',
    3: 'Embedding',
    4: 'Strategic',
    5: 'Innovating',
  }
  return labels[score] ?? 'Not Assessed'
}

/**
 * Returns a priority level ('high' | 'medium' | 'strong') based on score.
 */
export function getGoalPriorityLevel(score: number): 'high' | 'medium' | 'strong' {
  if (score <= 2) return 'high'
  if (score === 3) return 'medium'
  return 'strong'
}

