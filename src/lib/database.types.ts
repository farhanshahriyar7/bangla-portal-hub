export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      marital_information: {
        Row: {
          id: string
          user_id: string
          marital_status: 'married' | 'unmarried' | 'widow' | 'divorced' | 'widower'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          marital_status: 'married' | 'unmarried' | 'widow' | 'divorced' | 'widower'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          marital_status?: 'married' | 'unmarried' | 'widow' | 'divorced' | 'widower'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marital_information_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      spouse_information: {
        Row: {
          id: string
          marital_info_id: string
          user_id: string
          name: string
          occupation?: string
          nid?: string
          tin?: string
          district?: string
          employee_id?: string
          designation?: string
          office_address?: string
          office_phone?: string
          business_name?: string
          business_type?: string
          business_address?: string
          business_phone?: string
          business_reg_number?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          marital_info_id: string
          user_id: string
          name: string
          occupation?: string
          nid?: string
          tin?: string
          district?: string
          employee_id?: string
          designation?: string
          office_address?: string
          office_phone?: string
          business_name?: string
          business_type?: string
          business_address?: string
          business_phone?: string
          business_reg_number?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          marital_info_id?: string
          user_id?: string
          name?: string
          occupation?: string
          nid?: string
          tin?: string
          district?: string
          employee_id?: string
          designation?: string
          office_address?: string
          office_phone?: string
          business_name?: string
          business_type?: string
          business_address?: string
          business_phone?: string
          business_reg_number?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spouse_information_marital_info_id_fkey"
            columns: ["marital_info_id"]
            referencedRelation: "marital_information"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spouse_information_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]