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
          company_size: string
          industry_sector: string
        }
        Insert: {
          id?: string
          created_at?: string
          company_name: string
          contact_name: string
          contact_email: string
          company_size: string
          industry_sector: string
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
