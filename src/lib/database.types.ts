export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: string
          clientCode: string
          created_at: string
          email: string
          filterType: string | null
          id: number
          mapUrl: string
          name: string
          phone: string
          poolDimensions: string | null
          poolType: string | null
          poolVolume: string | null
          treatmentType: string | null
        }
        Insert: {
          address: string
          clientCode: string
          created_at?: string
          email: string
          filterType?: string | null
          id?: number
          mapUrl: string
          name: string
          phone: string
          poolDimensions?: string | null
          poolType?: string | null
          poolVolume?: string | null
          treatmentType?: string | null
        }
        Update: {
          address?: string
          clientCode?: string
          created_at?: string
          email?: string
          filterType?: string | null
          id?: number
          mapUrl?: string
          name?: string
          phone?: string
          poolDimensions?: string | null
          poolType?: string | null
          poolVolume?: string | null
          treatmentType?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          description: string | null
          dueDate: string
          dueTime: string | null
          id: number
          isCompleted: boolean
          relatedId: string | null
          relatedTo: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dueDate: string
          dueTime?: string | null
          id?: number
          isCompleted?: boolean
          relatedId?: string | null
          relatedTo: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dueDate?: string
          dueTime?: string | null
          id?: number
          isCompleted?: boolean
          relatedId?: string | null
          relatedTo?: string
          title?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          clientId: number
          created_at: string
          date: string
          description: string
          documents: Json | null
          duration: number | null
          id: number
          notes: string | null
          photos: Json | null
          priority: string
          status: string
          technicianIds: string[]
          time: string
        }
        Insert: {
          clientId: number
          created_at?: string
          date: string
          description: string
          documents?: Json | null
          duration?: number | null
          id?: number
          notes?: string | null
          photos?: Json | null
          priority: string
          status: string
          technicianIds: string[]
          time: string
        }
        Update: {
          clientId?: number
          created_at?: string
          date?: string
          description?: string
          documents?: Json | null
          duration?: number | null
          id?: number
          notes?: string | null
          photos?: Json | null
          priority?: string
          status?: string
          technicianIds?: string[]
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_clientId_fkey"
            columns: ["clientId"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          created_at: string
          firstName: string
          id: number
          lastName: string
          phone: string
          qualifications: Json | null
          role: string
        }
        Insert: {
          created_at?: string
          firstName: string
          id?: number
          lastName: string
          phone: string
          qualifications?: Json | null
          role: string
        }
        Update: {
          created_at?: string
          firstName?: string
          id?: number
          lastName?: string
          phone?: string
          qualifications?: Json | null
          role?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
