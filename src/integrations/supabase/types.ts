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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      config_agentes: {
        Row: {
          agente: string
          ativo: boolean | null
          config: Json | null
          id: string
          updated_at: string | null
        }
        Insert: {
          agente: string
          ativo?: boolean | null
          config?: Json | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          agente?: string
          ativo?: boolean | null
          config?: Json | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      logs_agentes: {
        Row: {
          agente: string
          created_at: string | null
          id: string
          mensagem: string
          payload: Json | null
          tipo: string | null
        }
        Insert: {
          agente: string
          created_at?: string | null
          id?: string
          mensagem: string
          payload?: Json | null
          tipo?: string | null
        }
        Update: {
          agente?: string
          created_at?: string | null
          id?: string
          mensagem?: string
          payload?: Json | null
          tipo?: string | null
        }
        Relationships: []
      }
      metricas: {
        Row: {
          created_at: string | null
          dados: Json | null
          id: string
          periodo: string | null
          tipo: string
          valor: number | null
        }
        Insert: {
          created_at?: string | null
          dados?: Json | null
          id?: string
          periodo?: string | null
          tipo: string
          valor?: number | null
        }
        Update: {
          created_at?: string | null
          dados?: Json | null
          id?: string
          periodo?: string | null
          tipo?: string
          valor?: number | null
        }
        Relationships: []
      }
      promocoes: {
        Row: {
          art_prompt: string | null
          bagagem: string | null
          cia_aerea: string | null
          classe: string | null
          created_at: string | null
          dados_extras: Json | null
          destino: string
          escalas: string | null
          fonte: string | null
          id: string
          margem_pct: number | null
          narration_script: string | null
          origem: string
          overlay_config: Json | null
          pct_desconto: number | null
          preco: number
          preco_cliente: number | null
          preco_normal: number | null
          prompt_variations: Json | null
          score: number | null
          score_justificativa: string | null
          status: string | null
          tipo_voo: string | null
          updated_at: string | null
          url_fonte: string | null
          validade: string | null
          video_prompt: string | null
        }
        Insert: {
          art_prompt?: string | null
          bagagem?: string | null
          cia_aerea?: string | null
          classe?: string | null
          created_at?: string | null
          dados_extras?: Json | null
          destino: string
          escalas?: string | null
          fonte?: string | null
          id?: string
          margem_pct?: number | null
          narration_script?: string | null
          origem: string
          overlay_config?: Json | null
          pct_desconto?: number | null
          preco: number
          preco_cliente?: number | null
          preco_normal?: number | null
          prompt_variations?: Json | null
          score?: number | null
          score_justificativa?: string | null
          status?: string | null
          tipo_voo?: string | null
          updated_at?: string | null
          url_fonte?: string | null
          validade?: string | null
          video_prompt?: string | null
        }
        Update: {
          art_prompt?: string | null
          bagagem?: string | null
          cia_aerea?: string | null
          classe?: string | null
          created_at?: string | null
          dados_extras?: Json | null
          destino?: string
          escalas?: string | null
          fonte?: string | null
          id?: string
          margem_pct?: number | null
          narration_script?: string | null
          origem?: string
          overlay_config?: Json | null
          pct_desconto?: number | null
          preco?: number
          preco_cliente?: number | null
          preco_normal?: number | null
          prompt_variations?: Json | null
          score?: number | null
          score_justificativa?: string | null
          status?: string | null
          tipo_voo?: string | null
          updated_at?: string | null
          url_fonte?: string | null
          validade?: string | null
          video_prompt?: string | null
        }
        Relationships: []
      }
      videos: {
        Row: {
          arte_url: string | null
          created_at: string | null
          elevenlabs_request_id: string | null
          erro_detalhes: string | null
          higgsfield_request_id: string | null
          id: string
          music_url: string | null
          narration_url: string | null
          payload: Json | null
          promocao_id: string | null
          scene_video_url: string | null
          status: string | null
          updated_at: string | null
          variation_label: string | null
          video_final_url: string | null
          video_url: string | null
        }
        Insert: {
          arte_url?: string | null
          created_at?: string | null
          elevenlabs_request_id?: string | null
          erro_detalhes?: string | null
          higgsfield_request_id?: string | null
          id?: string
          music_url?: string | null
          narration_url?: string | null
          payload?: Json | null
          promocao_id?: string | null
          scene_video_url?: string | null
          status?: string | null
          updated_at?: string | null
          variation_label?: string | null
          video_final_url?: string | null
          video_url?: string | null
        }
        Update: {
          arte_url?: string | null
          created_at?: string | null
          elevenlabs_request_id?: string | null
          erro_detalhes?: string | null
          higgsfield_request_id?: string | null
          id?: string
          music_url?: string | null
          narration_url?: string | null
          payload?: Json | null
          promocao_id?: string | null
          scene_video_url?: string | null
          status?: string | null
          updated_at?: string | null
          variation_label?: string | null
          video_final_url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_promocao_id_fkey"
            columns: ["promocao_id"]
            isOneToOne: false
            referencedRelation: "promocoes"
            referencedColumns: ["id"]
          },
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
    Enums: {},
  },
} as const
