import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { calculateTotalScore, getMaturityBand } from '@/lib/scoring'
import { upsertHubSpotContact } from '@/lib/hubspot'
import type { GoalScores } from '@/lib/scoring'
import type { Database, MaturityBand } from '@/lib/database.types'

type SupplierRow = Database['public']['Tables']['suppliers']['Row']
type AssessmentRow = Database['public']['Tables']['sged_assessments']['Row']

export interface DiagnosticSubmitPayload {
  // Step 1A — Supplier intake
  company_name: string
  contact_name: string
  contact_email: string
  company_size?: string
  industry_sector: string
  
  job_title?: string
  is_primary_contact?: boolean
  alternative_contacts?: any
  physical_address?: string
  description?: string
  logo_url?: string
  
  total_headcount?: number | null
  total_fte?: number | null
  workforce_female?: number | null
  workforce_male?: number | null
  workforce_non_binary?: number | null
  
  quartile_lower_female?: number | null
  quartile_lower_male?: number | null
  quartile_lower_non_binary?: number | null
  quartile_lower_middle_female?: number | null
  quartile_lower_middle_male?: number | null
  quartile_lower_middle_non_binary?: number | null
  quartile_upper_middle_female?: number | null
  quartile_upper_middle_male?: number | null
  quartile_upper_middle_non_binary?: number | null
  quartile_upper_female?: number | null
  quartile_upper_male?: number | null
  quartile_upper_non_binary?: number | null

  // Step 1B — 7-goal scores
  scores: GoalScores
}

export async function POST(request: NextRequest) {
  let payload: DiagnosticSubmitPayload

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // ── Validate required fields ─────────────────────────────────────────────
  const requiredFields: (keyof DiagnosticSubmitPayload)[] = [
    'company_name',
    'contact_name',
    'contact_email',
    'company_size',
    'industry_sector',
    'scores',
  ]

  for (const field of requiredFields) {
    if (!payload[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      )
    }
  }

  // Validate all 7 scores are present and in range 0–5
  const scoreFields: (keyof GoalScores)[] = [
    'flexible_working',
    'senior_representation',
    'executive_accountability',
    'frontline_progression',
    'intersectional_pay_gap',
    'bias_free_recruitment',
    'sponsorship_networks',
  ]

  for (const field of scoreFields) {
    const val = payload.scores[field]
    if (typeof val !== 'number' || val < 0 || val > 5) {
      return NextResponse.json(
        { error: `Score '${field}' must be a number between 0 and 5` },
        { status: 400 }
      )
    }
  }

  // ── Calculate score & band ───────────────────────────────────────────────
  const totalScore = calculateTotalScore(payload.scores)
  const maturityBand = getMaturityBand(totalScore)

  // ── Persist to Supabase ──────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // Upsert supplier (by email — prevents duplicate profiles)
  const { data: supplier, error: supplierError }: { data: SupplierRow | null; error: { message: string } | null } = await db
    .from('suppliers')
    .upsert(
      {
        company_name: payload.company_name,
        contact_name: payload.contact_name,
        contact_email: payload.contact_email,
        company_size: payload.company_size || null,
        industry_sector: payload.industry_sector,
        job_title: payload.job_title || null,
        is_primary_contact: payload.is_primary_contact ?? true,
        alternative_contacts: payload.alternative_contacts || [],
        physical_address: payload.physical_address || null,
        description: payload.description || null,
        logo_url: payload.logo_url || null,
      },
      { onConflict: 'contact_email' }
    )
    .select()
    .single()

  if (supplierError || !supplier) {
    console.error('[Supabase] Supplier upsert error:', supplierError)
    return NextResponse.json(
      { error: 'Failed to save supplier record', detail: supplierError?.message },
      { status: 500 }
    )
  }

  // Insert a new assessment record (each submission is a new snapshot in time)
  const { data: assessment, error: assessmentError }: { data: AssessmentRow | null; error: { message: string } | null } = await db
    .from('sged_assessments')
    .insert({
      supplier_id: supplier!.id,
      ...payload.scores,
      total_headcount: payload.total_headcount || null,
      total_fte: payload.total_fte || null,
      workforce_female: payload.workforce_female || null,
      workforce_male: payload.workforce_male || null,
      workforce_non_binary: payload.workforce_non_binary || null,
      quartile_lower_female: payload.quartile_lower_female || null,
      quartile_lower_male: payload.quartile_lower_male || null,
      quartile_lower_non_binary: payload.quartile_lower_non_binary || null,
      quartile_lower_middle_female: payload.quartile_lower_middle_female || null,
      quartile_lower_middle_male: payload.quartile_lower_middle_male || null,
      quartile_lower_middle_non_binary: payload.quartile_lower_middle_non_binary || null,
      quartile_upper_middle_female: payload.quartile_upper_middle_female || null,
      quartile_upper_middle_male: payload.quartile_upper_middle_male || null,
      quartile_upper_middle_non_binary: payload.quartile_upper_middle_non_binary || null,
      quartile_upper_female: payload.quartile_upper_female || null,
      quartile_upper_male: payload.quartile_upper_male || null,
      quartile_upper_non_binary: payload.quartile_upper_non_binary || null,
      total_score: totalScore,
      maturity_band: maturityBand,
      hubspot_synced: false,
    })
    .select()
    .single()

  if (assessmentError || !assessment) {
    console.error('[Supabase] Assessment insert error:', assessmentError)
    return NextResponse.json(
      { error: 'Failed to save assessment', detail: assessmentError?.message },
      { status: 500 }
    )
  }

  // ── Sync to HubSpot (non-blocking — failures don't break submission) ─────
  let hubspotId: string | null = null
  try {
    hubspotId = await upsertHubSpotContact({
      contactName: payload.contact_name,
      contactEmail: payload.contact_email,
      companyName: payload.company_name,
      scores: payload.scores,
      totalScore,
      maturityBand,
    })

    if (hubspotId && hubspotId !== 'skipped') {
      await db
        .from('sged_assessments')
        .update({ hubspot_synced: true })
        .eq('id', assessment!.id)
    }
  } catch (hubspotError) {
    console.error('[HubSpot] Sync error (non-fatal):', hubspotError)
    // We do NOT return an error — the submission is still valid without HubSpot
  }

  // ── Return the result to the client ─────────────────────────────────────
  return NextResponse.json(
    {
      success: true,
      assessment_id: assessment!.id,
      total_score: totalScore,
      maturity_band: maturityBand,
      scores: payload.scores,
      hubspot_synced: hubspotId !== null && hubspotId !== 'skipped',
    },
    { status: 201 }
  )
}
