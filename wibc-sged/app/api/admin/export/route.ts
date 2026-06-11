import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import type { MaturityBand } from '@/lib/database.types'

type AssessmentWithSupplier = {
  id: string
  created_at: string
  total_score: number
  maturity_band: MaturityBand
  flexible_working: number
  senior_representation: number
  executive_accountability: number
  frontline_progression: number
  intersectional_pay_gap: number
  bias_free_recruitment: number
  sponsorship_networks: number
  hubspot_synced: boolean
  suppliers: {
    company_name: string
    contact_name: string
    contact_email: string
    company_size: string
    industry_sector: string
  } | null
}

/**
 * Admin-only route: exports all supplier assessments as a CSV file.
 *
 * Protected by a shared secret passed via the `x-admin-secret` header.
 * Use: GET /api/admin/export
 */
export async function GET(request: NextRequest) {
  // ── Auth guard ──────────────────────────────────────────────────────────
  const secret = request.headers.get('x-admin-secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any

  const { data, error }: { data: AssessmentWithSupplier[] | null; error: { message: string } | null } = await db
    .from('sged_assessments')
    .select(`
      id,
      created_at,
      total_score,
      maturity_band,
      flexible_working,
      senior_representation,
      executive_accountability,
      frontline_progression,
      intersectional_pay_gap,
      bias_free_recruitment,
      sponsorship_networks,
      hubspot_synced,
      suppliers (
        company_name,
        contact_name,
        contact_email,
        company_size,
        industry_sector
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Admin] Export error:', error)
    return NextResponse.json({ error: 'Database error', detail: error.message }, { status: 500 })
  }

  // ── Build CSV ────────────────────────────────────────────────────────────
  const csvHeaders = [
    'Assessment ID',
    'Submitted At',
    'Company Name',
    'Contact Name',
    'Contact Email',
    'Company Size',
    'Industry Sector',
    'Total Score',
    'Maturity Band',
    'Flexible & Part-Time Working',
    'Representative Senior Leadership',
    'Executive Accountability & Safe Culture',
    'Progression from Lower-Paid Roles',
    'Closing the Intersectional Pay Gap',
    'Bias-Free Recruitment & Appraisals',
    'Mentoring, Sponsorship & Networks',
    'HubSpot Synced',
  ]

  const escape = (val: unknown) => {
    const str = String(val ?? '')
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }

  const csvRows = (data ?? []).map((row) => {
    // Supabase returns `suppliers` as an object (FK join), not an array
    const supplier = Array.isArray(row.suppliers) ? row.suppliers[0] : row.suppliers

    return [
      row.id,
      row.created_at,
      supplier?.company_name ?? '',
      supplier?.contact_name ?? '',
      supplier?.contact_email ?? '',
      supplier?.company_size ?? '',
      supplier?.industry_sector ?? '',
      row.total_score,
      row.maturity_band,
      row.flexible_working,
      row.senior_representation,
      row.executive_accountability,
      row.frontline_progression,
      row.intersectional_pay_gap,
      row.bias_free_recruitment,
      row.sponsorship_networks,
      row.hubspot_synced ? 'Yes' : 'No',
    ]
      .map(escape)
      .join(',')
  })

  const csv = [csvHeaders.join(','), ...csvRows].join('\n')

  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `wibc-sged-assessments-${timestamp}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
