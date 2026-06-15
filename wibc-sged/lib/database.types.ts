/**
 * TypeScript types auto-generated from the Supabase schema.
 * These mirror the SQL tables defined in supabase/schema.sql.
 */

export type MaturityBand = 'Emerging' | 'Developing' | 'Strategic' | 'Innovating'

export interface Database {
  public: {
    Tables: {
      suppliers: {
        Row: {
          id: string
          created_at: string
          company_name: string
          contact_name: string
          contact_email: string
          company_size: string | null
          industry_sector: string
          job_title: string | null
          is_primary_contact: boolean | null
          alternative_contacts: any | null
          physical_address: string | null
          description: string | null
          logo_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          company_name: string
          contact_name: string
          contact_email: string
          company_size?: string | null
          industry_sector: string
          job_title?: string | null
          is_primary_contact?: boolean | null
          alternative_contacts?: any | null
          physical_address?: string | null
          description?: string | null
          logo_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>
      }
      sged_assessments: {
        Row: {
          id: string
          created_at: string
          supplier_id: string
          flexible_working: number
          senior_representation: number
          executive_accountability: number
          frontline_progression: number
          intersectional_pay_gap: number
          bias_free_recruitment: number
          sponsorship_networks: number
          total_headcount: number | null
          total_fte: number | null
          workforce_female: number | null
          workforce_male: number | null
          workforce_non_binary: number | null
          quartile_lower_female: number | null
          quartile_lower_male: number | null
          quartile_lower_non_binary: number | null
          quartile_lower_middle_female: number | null
          quartile_lower_middle_male: number | null
          quartile_lower_middle_non_binary: number | null
          quartile_upper_middle_female: number | null
          quartile_upper_middle_male: number | null
          quartile_upper_middle_non_binary: number | null
          quartile_upper_female: number | null
          quartile_upper_male: number | null
          quartile_upper_non_binary: number | null
          total_score: number
          maturity_band: MaturityBand
          hubspot_synced: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          supplier_id: string
          flexible_working: number
          senior_representation: number
          executive_accountability: number
          frontline_progression: number
          intersectional_pay_gap: number
          bias_free_recruitment: number
          sponsorship_networks: number
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
          total_score: number
          maturity_band: MaturityBand
          hubspot_synced?: boolean
        }
        Update: Partial<Database['public']['Tables']['sged_assessments']['Insert']>
      }
      interested: {
        Row: {
          id: string
          created_at: string
          name: string
          surname: string
          company: string
          position: string
          email: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          surname: string
          company: string
          position: string
          email: string
        }
        Update: Partial<Database['public']['Tables']['interested']['Insert']>
      }
    }
  }
}
