export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      marital_information: {
        Row: {
          id: string
          user_id: string
          marital_status: 'married' | 'unmarried' | 'widow' | 'divorced' | 'widower'
          created_at: string
          updated_at: string
          spouse_information?: Database['public']['Tables']['spouse_information']['Row'][]
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
          occupation?: string | null
          nid?: string | null
          tin?: string | null
          district?: string | null
          employee_id?: string | null
          designation?: string | null
          office_address?: string | null
          office_phone?: string | null
          business_name?: string | null
          business_type?: string | null
          business_address?: string | null
          business_phone?: string | null
          business_reg_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          marital_info_id?: string
          user_id?: string
          name?: string
          occupation?: string | null
          nid?: string | null
          tin?: string | null
          district?: string | null
          employee_id?: string | null
          designation?: string | null
          office_address?: string | null
          office_phone?: string | null
          business_name?: string | null
          business_type?: string | null
          business_address?: string | null
          business_phone?: string | null
          business_reg_number?: string | null
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
      },
      office_information: {
        Row: {
          birth_place: string
          created_at: string
          directorate: string
          district: string
          id: string
          identity_number: string | null
          ministry: string
          nid: string
          status: string
          tin: string | null
          upazila: string
          updated_at: string
          user_id: string
          village: string
        }
        Insert: {
          birth_place: string
          created_at?: string
          directorate: string
          district: string
          id?: string
          identity_number?: string | null
          ministry: string
          nid: string
          status?: string
          tin?: string | null
          upazila: string
          updated_at?: string
          user_id: string
          village: string
        }
        Update: {
          birth_place?: string
          created_at?: string
          directorate?: string
          district?: string
          id?: string
          identity_number?: string | null
          ministry?: string
          nid?: string
          status?: string
          tin?: string | null
          upazila?: string
          updated_at?: string
          user_id?: string
          village?: string
        }
        Relationships: []
      }
      general_information: {
        Row: {
          id: string
          user_id: string
          father_name: string | null
          mother_name: string | null
          office_address: string | null
          blood_group: string | null
          current_position_joining_date: string | null
          workplace_address: string | null
          workplace_phone: string | null
          current_address: string | null
          confirmation_order_number: string | null
          confirmation_order_date: string | null
          mobile_phone: string | null
          special_illness_info: string | null
          special_case: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          father_name?: string | null
          mother_name?: string | null
          office_address?: string | null
          blood_group?: string | null
          current_position_joining_date?: string | null
          workplace_address?: string | null
          workplace_phone?: string | null
          current_address?: string | null
          confirmation_order_number?: string | null
          confirmation_order_date?: string | null
          mobile_phone?: string | null
          special_illness_info?: string | null
          special_case?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          father_name?: string | null
          mother_name?: string | null
          office_address?: string | null
          blood_group?: string | null
          current_position_joining_date?: string | null
          workplace_address?: string | null
          workplace_phone?: string | null
          current_address?: string | null
          confirmation_order_number?: string | null
          confirmation_order_date?: string | null
          mobile_phone?: string | null
          special_illness_info?: string | null
          special_case?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_general_information_user"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          current_position: string | null
          date_of_birth: string | null
          department: string | null
          designation: string | null
          district: string | null
          email: string
          employee_id: string | null
          full_name: string
          gender: string | null
          grade: string | null
          id: string
          id_proof_url: string | null
          is_verified: boolean | null
          joining_date: string | null
          nid_number: string | null
          office_name: string | null
          passport_photo_url: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string | null
          verification_requested_at: string | null
          verified_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          current_position?: string | null
          date_of_birth?: string | null
          department?: string | null
          designation?: string | null
          district?: string | null
          email: string
          employee_id?: string | null
          full_name: string
          gender?: string | null
          grade?: string | null
          id: string
          id_proof_url?: string | null
          is_verified?: boolean | null
          joining_date?: string | null
          nid_number?: string | null
          office_name?: string | null
          passport_photo_url?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          verification_requested_at?: string | null
          verified_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          current_position?: string | null
          date_of_birth?: string | null
          department?: string | null
          designation?: string | null
          district?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string
          gender?: string | null
          grade?: string | null
          id?: string
          id_proof_url?: string | null
          is_verified?: boolean | null
          joining_date?: string | null
          nid_number?: string | null
          office_name?: string | null
          passport_photo_url?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          verification_requested_at?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
