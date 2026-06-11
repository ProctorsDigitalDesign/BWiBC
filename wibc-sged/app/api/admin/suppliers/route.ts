import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

/**
 * Admin-only route: returns all suppliers joined with their latest assessment.
 *
 * Protected by a shared secret passed via the `x-admin-secret` header.
 * Use: GET /api/admin/suppliers
 */
export async function GET(request: NextRequest) {
  // ── Auth guard ──────────────────────────────────────────────────────────
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  // Fetch all suppliers with their most recent assessment
  const { data, error }: { data: unknown[] | null; error: { message: string } | null } = await db
    .from('suppliers')
    .select(`
      id,
      created_at,
      company_name,
      contact_name,
      contact_email,
      company_size,
      industry_sector,
      sged_assessments (
        id,
        created_at,
        flexible_working,
        senior_representation,
        executive_accountability,
        frontline_progression,
        intersectional_pay_gap,
        bias_free_recruitment,
        sponsorship_networks,
        total_score,
        maturity_band,
        hubspot_synced
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Admin] Suppliers fetch error:', error)
    return NextResponse.json({ error: 'Database error', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ suppliers: data })
}
