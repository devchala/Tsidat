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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          completed_at: string | null
          completion_image_path: string | null
          completion_notes: string | null
          created_at: string
          en_route_at: string | null
          id: string
          incident_id: string
          override_reason: string | null
          reassignment_reason: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          submitted_at: string | null
          verification_note: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          worker_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          completed_at?: string | null
          completion_image_path?: string | null
          completion_notes?: string | null
          created_at?: string
          en_route_at?: string | null
          id?: string
          incident_id: string
          override_reason?: string | null
          reassignment_reason?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          submitted_at?: string | null
          verification_note?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          worker_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          completed_at?: string | null
          completion_image_path?: string | null
          completion_notes?: string | null
          created_at?: string
          en_route_at?: string | null
          id?: string
          incident_id?: string
          override_reason?: string | null
          reassignment_reason?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          submitted_at?: string | null
          verification_note?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          report_id: string
          resident_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          report_id: string
          resident_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          report_id?: string
          resident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          accepted_at: string
          assigned_at: string | null
          category: Database["public"]["Enums"]["waste_category"]
          completed_at: string | null
          created_at: string
          created_by: string | null
          id: string
          latitude: number
          location_description: string | null
          longitude: number
          priority_level: Database["public"]["Enums"]["priority_level"]
          priority_reason: string | null
          priority_score: number
          reference: string
          status: Database["public"]["Enums"]["report_status"]
          title: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string
          assigned_at?: string | null
          category: Database["public"]["Enums"]["waste_category"]
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          latitude: number
          location_description?: string | null
          longitude: number
          priority_level?: Database["public"]["Enums"]["priority_level"]
          priority_reason?: string | null
          priority_score?: number
          reference?: string
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string
          assigned_at?: string | null
          category?: Database["public"]["Enums"]["waste_category"]
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          latitude?: number
          location_description?: string | null
          longitude?: number
          priority_level?: Database["public"]["Enums"]["priority_level"]
          priority_reason?: string | null
          priority_score?: number
          reference?: string
          status?: Database["public"]["Enums"]["report_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          area: string | null
          available: boolean
          created_at: string
          display_name: string
          id: string
          phone: string | null
          updated_at: string
          worker_status: Database["public"]["Enums"]["worker_status"]
        }
        Insert: {
          account_status?: string
          area?: string | null
          available?: boolean
          created_at?: string
          display_name?: string
          id: string
          phone?: string | null
          updated_at?: string
          worker_status?: Database["public"]["Enums"]["worker_status"]
        }
        Update: {
          account_status?: string
          area?: string | null
          available?: boolean
          created_at?: string
          display_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          worker_status?: Database["public"]["Enums"]["worker_status"]
        }
        Relationships: []
      }
      reports: {
        Row: {
          category: Database["public"]["Enums"]["waste_category"]
          created_at: string
          description: string
          id: string
          image_path: string
          incident_id: string | null
          latitude: number
          location_description: string | null
          longitude: number
          priority_level: Database["public"]["Enums"]["priority_level"]
          priority_score: number
          reference: string
          resident_id: string
          review_reason: string | null
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["waste_category"]
          created_at?: string
          description: string
          id?: string
          image_path: string
          incident_id?: string | null
          latitude: number
          location_description?: string | null
          longitude: number
          priority_level?: Database["public"]["Enums"]["priority_level"]
          priority_score?: number
          reference?: string
          resident_id: string
          review_reason?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["waste_category"]
          created_at?: string
          description?: string
          id?: string
          image_path?: string
          incident_id?: string | null
          latitude?: number
          location_description?: string | null
          longitude?: number
          priority_level?: Database["public"]["Enums"]["priority_level"]
          priority_score?: number
          reference?: string
          resident_id?: string
          review_reason?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      status_history: {
        Row: {
          actor_id: string | null
          actor_role: string | null
          assignment_id: string | null
          created_at: string
          evidence_path: string | null
          from_status: Database["public"]["Enums"]["report_status"] | null
          id: string
          incident_id: string | null
          note: string | null
          report_id: string | null
          to_status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          actor_id?: string | null
          actor_role?: string | null
          assignment_id?: string | null
          created_at?: string
          evidence_path?: string | null
          from_status?: Database["public"]["Enums"]["report_status"] | null
          id?: string
          incident_id?: string | null
          note?: string | null
          report_id?: string | null
          to_status: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          actor_id?: string | null
          actor_role?: string | null
          assignment_id?: string | null
          created_at?: string
          evidence_path?: string | null
          from_status?: Database["public"]["Enums"]["report_status"] | null
          id?: string
          incident_id?: string | null
          note?: string | null
          report_id?: string | null
          to_status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "status_history_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_history_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_history_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      worker_applications: {
        Row: {
          created_at: string
          experience: string
          id: string
          national_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_area: string
          status: Database["public"]["Enums"]["worker_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          experience?: string
          id?: string
          national_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_area?: string
          status?: Database["public"]["Enums"]["worker_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          experience?: string
          id?: string
          national_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_area?: string
          status?: Database["public"]["Enums"]["worker_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_assign_worker: {
        Args: { _incident: string; _reason?: string; _worker: string }
        Returns: string
      }
      admin_reopen_incident: {
        Args: { _incident: string; _reason: string }
        Returns: undefined
      }
      admin_review_report: {
        Args: {
          _action: string
          _incident?: string
          _reason: string
          _report: string
        }
        Returns: string
      }
      admin_set_account_status: {
        Args: { _reason: string; _status: string; _user: string }
        Returns: undefined
      }
      admin_set_priority: {
        Args: {
          _incident: string
          _level: Database["public"]["Enums"]["priority_level"]
          _reason: string
        }
        Returns: undefined
      }
      admin_set_role: {
        Args: {
          _grant: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _user: string
        }
        Returns: undefined
      }
      admin_set_worker_status: {
        Args: {
          _reason?: string
          _status: Database["public"]["Enums"]["worker_status"]
          _user: string
        }
        Returns: undefined
      }
      admin_verify_completion: {
        Args: {
          _approve: boolean
          _assignment: string
          _note: string
          _override?: boolean
        }
        Returns: undefined
      }
      analytics_summary: { Args: { _from: string; _to: string }; Returns: Json }
      audit: {
        Args: { _action: string; _details: Json; _id: string; _type: string }
        Returns: undefined
      }
      category_weight: {
        Args: { c: Database["public"]["Enums"]["waste_category"] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_worker: { Args: { _user_id: string }; Returns: boolean }
      level_for: {
        Args: { score: number }
        Returns: Database["public"]["Enums"]["priority_level"]
      }
      nearby_reports: {
        Args: {
          _category?: Database["public"]["Enums"]["waste_category"]
          _lat: number
          _lng: number
        }
        Returns: {
          category: Database["public"]["Enums"]["waste_category"]
          created_at: string
          distance_m: number
          reference: string
          status: Database["public"]["Enums"]["report_status"]
        }[]
      }
      notify: {
        Args: { _body: string; _link: string; _title: string; _user: string }
        Returns: undefined
      }
      propagate_incident_status: {
        Args: {
          _assignment: string
          _evidence: string
          _incident: string
          _note: string
          _role: string
          _to: Database["public"]["Enums"]["report_status"]
        }
        Returns: undefined
      }
      require_admin: { Args: never; Returns: undefined }
      resident_on_incident: {
        Args: { _incident: string; _user: string }
        Returns: boolean
      }
      worker_on_incident: {
        Args: { _incident: string; _user: string }
        Returns: boolean
      }
      worker_update_task: {
        Args: {
          _assignment: string
          _image?: string
          _notes?: string
          _to: Database["public"]["Enums"]["assignment_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "resident" | "worker" | "admin" | "planner" | "superadmin"
      assignment_status:
        | "assigned"
        | "en_route"
        | "in_progress"
        | "awaiting_verification"
        | "completed"
        | "reassigned"
        | "rejected"
      priority_level: "low" | "medium" | "high" | "critical"
      report_status:
        | "submitted"
        | "under_review"
        | "accepted"
        | "assigned"
        | "en_route"
        | "in_progress"
        | "awaiting_verification"
        | "completed"
        | "rejected"
        | "reopened"
      waste_category:
        | "overflowing_bin"
        | "household_waste"
        | "illegal_dumping"
        | "construction_waste"
        | "street_litter"
        | "drainage_blockage"
        | "hazardous"
        | "other"
      worker_status: "none" | "pending" | "approved" | "rejected" | "suspended"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["resident", "worker", "admin", "planner", "superadmin"],
      assignment_status: [
        "assigned",
        "en_route",
        "in_progress",
        "awaiting_verification",
        "completed",
        "reassigned",
        "rejected",
      ],
      priority_level: ["low", "medium", "high", "critical"],
      report_status: [
        "submitted",
        "under_review",
        "accepted",
        "assigned",
        "en_route",
        "in_progress",
        "awaiting_verification",
        "completed",
        "rejected",
        "reopened",
      ],
      waste_category: [
        "overflowing_bin",
        "household_waste",
        "illegal_dumping",
        "construction_waste",
        "street_litter",
        "drainage_blockage",
        "hazardous",
        "other",
      ],
      worker_status: ["none", "pending", "approved", "rejected", "suspended"],
    },
  },
} as const
