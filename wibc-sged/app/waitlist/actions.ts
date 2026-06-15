'use server'
import { createAdminClient } from '@/lib/supabase'
import { submitWaitlistFormToHubSpot } from '@/lib/hubspot'
import { headers, cookies } from 'next/headers'

export async function submitInterest(formData: FormData) {
  const name = formData.get('name') as string
  const surname = formData.get('surname') as string
  const company = formData.get('company') as string
  const position = formData.get('position') as string
  const email = formData.get('email') as string

  if (!name || !surname || !company || !position || !email) {
    return { error: 'All fields are required.' }
  }

  try {
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin
      .from('interested')
      .insert({
        name,
        surname,
        company,
        position,
        email,
      } as any)

    if (error) {
      // Catch unique constraint violation for email
      if (error.code === '23505') {
        return { error: 'This email is already registered on the waitlist.' }
      }
      console.error('Supabase error inserting interest:', error)
      return { error: 'An unexpected error occurred. Please try again later.' }
    }

    // Retrieve request-level context for HubSpot attribution
    let pageUri = ''
    let hutk = ''
    try {
      const reqHeaders = await headers()
      pageUri = reqHeaders.get('referer') || ''

      const cookieStore = await cookies()
      hutk = cookieStore.get('hubspotutk')?.value || ''
    } catch (e) {
      console.warn('[HubSpot] Failed to retrieve server action request context:', e)
    }

    // Sync to HubSpot (non-blocking)
    try {
      await submitWaitlistFormToHubSpot({
        firstname: name,
        lastname: surname,
        email,
        company,
        position,
        pageUri,
        hutk,
      })
    } catch (hubspotError) {
      console.error('[HubSpot] Waitlist sync error (non-fatal):', hubspotError)
    }

    return { success: true }
  } catch (err) {
    console.error('Server error submitting interest:', err)
    return { error: 'A server error occurred. Please try again.' }
  }
}


