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
  if (totalScore <= 30) return 'Strategic'
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
      "Outstanding work! Your strong alignment with gender equity values positions you as a highly attractive partner for procurement teams. Consider becoming a full WiBC Signatory to publicly showcase your leadership.",
    Innovating:
      "Exceptional! Your organisation is a sector-leading benchmark. We invite you to partner with WiBC to co-author best practice guides, share your insights, and mentor other businesses in the region.",
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
      "Your organisation is actively embedding inclusive practices and developing an intersectional focus.",
    Strategic:
      'Your organisation is a leader in gender equity with strongly embedded practices and policies.',
    Innovating:
      'Your organisation is setting sector-wide standards for equity, transparency, and inclusive culture.',
  }
  return descriptions[band]
}
