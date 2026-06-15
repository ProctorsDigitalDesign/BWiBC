import type { GoalScores } from './scoring'
import type { MaturityBand } from './database.types'

const HUBSPOT_API_BASE = 'https://api.hubapi.com'

interface HubSpotContactProperties {
  email: string
  firstname: string
  lastname: string
  company: string
  // Custom SGED properties
  sged_total_score: number
  sged_maturity_band: MaturityBand
  sged_flexible_working: number
  sged_senior_representation: number
  sged_executive_accountability: number
  sged_frontline_progression: number
  sged_intersectional_pay_gap: number
  sged_bias_free_recruitment: number
  sged_sponsorship_networks: number
}

/**
 * Searches HubSpot for a contact by email address.
 * Returns the contact ID if found, or null if not found.
 */
async function findContactByEmail(email: string, token: string): Promise<string | null> {
  const response = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              { propertyName: 'email', operator: 'EQ', value: email },
            ],
          },
        ],
        properties: ['email'],
        limit: 1,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HubSpot search failed: ${response.status} ${error}`)
  }

  const data = await response.json()
  return data.results?.[0]?.id ?? null
}

/**
 * Creates a new HubSpot contact with the supplier's details and SGED scores.
 */
async function createContact(
  properties: HubSpotContactProperties,
  token: string
): Promise<string> {
  const response = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ properties }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HubSpot create contact failed: ${response.status} ${error}`)
  }

  const data = await response.json()
  return data.id
}

/**
 * Updates an existing HubSpot contact with new SGED scores.
 */
async function updateContact(
  contactId: string,
  properties: Partial<HubSpotContactProperties>,
  token: string
): Promise<void> {
  const response = await fetch(
    `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/${contactId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HubSpot update contact failed: ${response.status} ${error}`)
  }
}

/**
 * Main entry point: upserts (creates or updates) a HubSpot contact with SGED data.
 *
 * @returns The HubSpot contact ID.
 */
export async function upsertHubSpotContact(params: {
  contactName: string
  contactEmail: string
  companyName: string
  scores: GoalScores
  totalScore: number
  maturityBand: MaturityBand
}): Promise<string> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN

  if (!token || token === 'your-hubspot-private-app-token') {
    console.warn(
      '[HubSpot] HUBSPOT_ACCESS_TOKEN not configured — skipping CRM sync.'
    )
    return 'skipped'
  }

  const nameParts = params.contactName.trim().split(' ')
  const firstname = nameParts[0] ?? ''
  const lastname = nameParts.slice(1).join(' ') ?? ''

  const sgedProperties = {
    sged_total_score: params.totalScore,
    sged_maturity_band: params.maturityBand,
    sged_flexible_working: params.scores.flexible_working,
    sged_senior_representation: params.scores.senior_representation,
    sged_executive_accountability: params.scores.executive_accountability,
    sged_frontline_progression: params.scores.frontline_progression,
    sged_intersectional_pay_gap: params.scores.intersectional_pay_gap,
    sged_bias_free_recruitment: params.scores.bias_free_recruitment,
    sged_sponsorship_networks: params.scores.sponsorship_networks,
  }

  const existingId = await findContactByEmail(params.contactEmail, token)

  if (existingId) {
    await updateContact(existingId, sgedProperties, token)
    console.log(`[HubSpot] Updated contact ${existingId} (${params.contactEmail})`)
    return existingId
  } else {
    const newId = await createContact(
      {
        email: params.contactEmail,
        firstname,
        lastname,
        company: params.companyName,
        ...sgedProperties,
      },
      token
    )
    console.log(`[HubSpot] Created contact ${newId} (${params.contactEmail})`)
    return newId
  }
}

/**
 * Creates or updates a HubSpot contact specifically for waitlist submissions.
 */
export async function upsertHubSpotWaitlistContact(params: {
  firstname: string
  lastname: string
  email: string
  company: string
  position: string
}): Promise<string> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN

  if (!token || token === 'your-hubspot-private-app-token') {
    console.warn(
      '[HubSpot] HUBSPOT_ACCESS_TOKEN not configured — skipping waitlist CRM sync.'
    )
    return 'skipped'
  }

  const properties = {
    email: params.email,
    firstname: params.firstname,
    lastname: params.lastname,
    company: params.company,
    jobtitle: params.position,
  }

  const existingId = await findContactByEmail(params.email, token)

  if (existingId) {
    await updateContact(existingId, properties, token)
    console.log(`[HubSpot] Updated waitlist contact ${existingId} (${params.email})`)
    return existingId
  } else {
    const newId = await createContact(
      properties as any,
      token
    )
    console.log(`[HubSpot] Created waitlist contact ${newId} (${params.email})`)
    return newId
  }
}

