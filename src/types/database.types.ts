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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      availability: {
        Row: {
          created_at: string | null
          date: string
          day_of_week: number | null
          end_time: string
          id: string
          is_available: boolean | null
          notes: string | null
          recurring: boolean | null
          start_time: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          day_of_week?: number | null
          end_time: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          recurring?: boolean | null
          start_time: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          recurring?: boolean | null
          start_time?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      booking: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          assigned_employee_id: string | null
          assignment_date: string | null
          created_at: string | null
          customer_address: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          deposit_required: number | null
          estimated_value: number | null
          id: string
          images: Json | null
          notes: string | null
          payment_status: string | null
          preferred_date: string | null
          reference_number: string
          referral_code_used: string | null
          service_cost: number | null
          service_details: string | null
          service_type: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          assigned_employee_id?: string | null
          assignment_date?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          deposit_required?: number | null
          estimated_value?: number | null
          id?: string
          images?: Json | null
          notes?: string | null
          payment_status?: string | null
          preferred_date?: string | null
          reference_number: string
          referral_code_used?: string | null
          service_cost?: number | null
          service_details?: string | null
          service_type: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          assigned_employee_id?: string | null
          assignment_date?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          deposit_required?: number | null
          estimated_value?: number | null
          id?: string
          images?: Json | null
          notes?: string | null
          payment_status?: string | null
          preferred_date?: string | null
          reference_number?: string
          referral_code_used?: string | null
          service_cost?: number | null
          service_details?: string | null
          service_type?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          booking_id: string | null
          category: string
          created_at: string | null
          created_by: string
          description: string
          expense_date: string
          id: string
          payment_method: string | null
          receipt_path: string | null
          reimbursable: boolean | null
          status: string | null
          tax_amount: number | null
          vendor: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          booking_id?: string | null
          category: string
          created_at?: string | null
          created_by: string
          description: string
          expense_date: string
          id?: string
          payment_method?: string | null
          receipt_path?: string | null
          reimbursable?: boolean | null
          status?: string | null
          tax_amount?: number | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          booking_id?: string | null
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string
          expense_date?: string
          id?: string
          payment_method?: string | null
          receipt_path?: string | null
          reimbursable?: boolean | null
          status?: string | null
          tax_amount?: number | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_item: {
        Row: {
          before_image_id: string | null
          category: string
          completion_date: string | null
          created_at: string | null
          description: string | null
          file_path: string
          file_type: string
          id: string
          is_before_after: boolean | null
          is_featured: boolean | null
          is_first: boolean | null
          location: string | null
          project_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          before_image_id?: string | null
          category: string
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          file_path: string
          file_type: string
          id?: string
          is_before_after?: boolean | null
          is_featured?: boolean | null
          is_first?: boolean | null
          location?: string | null
          project_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          before_image_id?: string | null
          category?: string
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_type?: string
          id?: string
          is_before_after?: boolean | null
          is_featured?: boolean | null
          is_first?: boolean | null
          location?: string | null
          project_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_item_before_image_id_fkey"
            columns: ["before_image_id"]
            isOneToOne: false
            referencedRelation: "gallery_item"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          condition: string | null
          cost_per_unit: number | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          last_maintenance_date: string | null
          last_ordered_date: string | null
          last_received_date: string | null
          location: string | null
          max_stock_level: number | null
          min_stock_level: number | null
          name: string
          next_maintenance_date: string | null
          notes: string | null
          quantity_in_stock: number
          reorder_point: number | null
          sku: string | null
          status: string | null
          supplier_contact: string | null
          supplier_email: string | null
          supplier_name: string | null
          supplier_phone: string | null
          unit: string
          updated_at: string | null
          updated_by: string | null
          warranty_expiry_date: string | null
        }
        Insert: {
          category: string
          condition?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          last_maintenance_date?: string | null
          last_ordered_date?: string | null
          last_received_date?: string | null
          location?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name: string
          next_maintenance_date?: string | null
          notes?: string | null
          quantity_in_stock?: number
          reorder_point?: number | null
          sku?: string | null
          status?: string | null
          supplier_contact?: string | null
          supplier_email?: string | null
          supplier_name?: string | null
          supplier_phone?: string | null
          unit: string
          updated_at?: string | null
          updated_by?: string | null
          warranty_expiry_date?: string | null
        }
        Update: {
          category?: string
          condition?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          last_maintenance_date?: string | null
          last_ordered_date?: string | null
          last_received_date?: string | null
          location?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name?: string
          next_maintenance_date?: string | null
          notes?: string | null
          quantity_in_stock?: number
          reorder_point?: number | null
          sku?: string | null
          status?: string | null
          supplier_contact?: string | null
          supplier_email?: string | null
          supplier_name?: string | null
          supplier_phone?: string | null
          unit?: string
          updated_at?: string | null
          updated_by?: string | null
          warranty_expiry_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          booking_id: string | null
          created_at: string | null
          created_by: string
          id: string
          inventory_item_id: string
          location_from: string | null
          location_to: string | null
          notes: string | null
          project_name: string | null
          quantity: number
          reason: string | null
          supplier_invoice_number: string | null
          total_cost: number | null
          transaction_date: string | null
          transaction_type: string
          unit_cost: number | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          inventory_item_id: string
          location_from?: string | null
          location_to?: string | null
          notes?: string | null
          project_name?: string | null
          quantity: number
          reason?: string | null
          supplier_invoice_number?: string | null
          total_cost?: number | null
          transaction_date?: string | null
          transaction_type: string
          unit_cost?: number | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          inventory_item_id?: string
          location_from?: string | null
          location_to?: string | null
          notes?: string | null
          project_name?: string | null
          quantity?: number
          reason?: string | null
          supplier_invoice_number?: string | null
          total_cost?: number | null
          transaction_date?: string | null
          transaction_type?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          item_type: string | null
          quantity: number
          tax_rate: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          item_type?: string | null
          quantity: number
          tax_rate?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          item_type?: string | null
          quantity?: number
          tax_rate?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          booking_id: string
          created_at: string | null
          created_by: string
          discount_amount: number | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          terms: string | null
          total_amount: number
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          created_by: string
          discount_amount?: number | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date: string
          notes?: string | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          terms?: string | null
          total_amount: number
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          created_by?: string
          discount_amount?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          terms?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assignment: {
        Row: {
          assigned_by: string | null
          assigned_date: string | null
          booking_id: string
          created_at: string | null
          employee_id: string | null
          end_time: string | null
          id: string
          job_address: string | null
          notes: string | null
          role: string | null
          start_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string | null
          booking_id: string
          created_at?: string | null
          employee_id?: string | null
          end_time?: string | null
          id?: string
          job_address?: string | null
          notes?: string | null
          role?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string | null
          booking_id?: string
          created_at?: string | null
          employee_id?: string | null
          end_time?: string | null
          id?: string
          job_address?: string | null
          notes?: string | null
          role?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_assignment_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignment_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignment_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      material_usage: {
        Row: {
          booking_id: string
          id: string
          inventory_item_id: string
          notes: string | null
          phase_id: string | null
          quantity_used: number
          recorded_by: string
          total_cost: number | null
          unit: string
          unit_cost: number | null
          usage_date: string | null
        }
        Insert: {
          booking_id: string
          id?: string
          inventory_item_id: string
          notes?: string | null
          phase_id?: string | null
          quantity_used: number
          recorded_by: string
          total_cost?: number | null
          unit: string
          unit_cost?: number | null
          usage_date?: string | null
        }
        Update: {
          booking_id?: string
          id?: string
          inventory_item_id?: string
          notes?: string | null
          phase_id?: string | null
          quantity_used?: number
          recorded_by?: string
          total_cost?: number | null
          unit?: string
          unit_cost?: number | null
          usage_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_usage_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_usage_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_usage_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_usage_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          created_by: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_method: string
          payment_provider: string | null
          provider_transaction_id: string | null
          transaction_date: string
          transaction_reference: string | null
          transaction_status: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method: string
          payment_provider?: string | null
          provider_transaction_id?: string | null
          transaction_date: string
          transaction_reference?: string | null
          transaction_status: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_method?: string
          payment_provider?: string | null
          provider_transaction_id?: string | null
          transaction_date?: string
          transaction_reference?: string | null
          transaction_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          booking_id: string
          description: string | null
          document_type: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          status: string | null
          title: string
          uploaded_at: string | null
          uploaded_by: string
          version: string | null
        }
        Insert: {
          booking_id: string
          description?: string | null
          document_type: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          status?: string | null
          title: string
          uploaded_at?: string | null
          uploaded_by: string
          version?: string | null
        }
        Update: {
          booking_id?: string
          description?: string | null
          document_type?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          status?: string | null
          title?: string
          uploaded_at?: string | null
          uploaded_by?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          assigned_to: string | null
          booking_id: string
          completion_date: string | null
          created_at: string | null
          created_by: string
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          id: string
          order_number: number
          phase_name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          booking_id: string
          completion_date?: string | null
          created_at?: string | null
          created_by: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          order_number: number
          phase_name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string
          completion_date?: string | null
          created_at?: string | null
          created_by?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          id?: string
          order_number?: number
          phase_name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_phases_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_phases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          item_type: string
          notes: string | null
          order: number | null
          quantity: number | null
          quote_id: string
          total_price: number | null
          unit: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          item_type: string
          notes?: string | null
          order?: number | null
          quantity?: number | null
          quote_id: string
          total_price?: number | null
          unit: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          item_type?: string
          notes?: string | null
          order?: number | null
          quantity?: number | null
          quote_id?: string
          total_price?: number | null
          unit?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          booking_id: string | null
          created_at: string | null
          created_by: string
          customer_address: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount_amount: number | null
          discount_type: string | null
          estimated_duration: string | null
          id: string
          is_template: boolean | null
          notes: string | null
          project_start_date: string | null
          reference_number: string
          service_description: string | null
          service_type: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          template_name: string | null
          terms_conditions: string | null
          total_amount: number | null
          updated_at: string | null
          valid_until: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          created_by: string
          customer_address?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          estimated_duration?: string | null
          id?: string
          is_template?: boolean | null
          notes?: string | null
          project_start_date?: string | null
          reference_number: string
          service_description?: string | null
          service_type: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          template_name?: string | null
          terms_conditions?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          created_by?: string
          customer_address?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          estimated_duration?: string | null
          id?: string
          is_template?: boolean | null
          notes?: string | null
          project_start_date?: string | null
          reference_number?: string
          service_description?: string | null
          service_type?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          template_name?: string | null
          terms_conditions?: string | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      referral: {
        Row: {
          booking_id: string | null
          created_at: string | null
          credit_amount: number | null
          id: string
          referral_code: string | null
          referred_email: string | null
          referrer_id: string
          status: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          credit_amount?: number | null
          id?: string
          referral_code?: string | null
          referred_email?: string | null
          referrer_id: string
          status?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          credit_amount?: number | null
          id?: string
          referral_code?: string | null
          referred_email?: string | null
          referrer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      report_schedules: {
        Row: {
          created_at: string | null
          created_by: string
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          recipient_emails: string[] | null
          saved_report_id: string
          schedule_config: Json
        }
        Insert: {
          created_at?: string | null
          created_by: string
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipient_emails?: string[] | null
          saved_report_id: string
          schedule_config: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          recipient_emails?: string[] | null
          saved_report_id?: string
          schedule_config?: Json
        }
        Relationships: [
          {
            foreignKeyName: "report_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_schedules_saved_report_id_fkey"
            columns: ["saved_report_id"]
            isOneToOne: false
            referencedRelation: "saved_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_system_template: boolean | null
          name: string
          report_type: string
          template_config: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_system_template?: boolean | null
          name: string
          report_type: string
          template_config: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_system_template?: boolean | null
          name?: string
          report_type?: string
          template_config?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_reports: {
        Row: {
          column_config: Json | null
          created_at: string | null
          created_by: string
          description: string | null
          filter_criteria: Json | null
          id: string
          last_run_at: string | null
          name: string
          sort_criteria: Json | null
          template_id: string | null
        }
        Insert: {
          column_config?: Json | null
          created_at?: string | null
          created_by: string
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          last_run_at?: string | null
          name: string
          sort_criteria?: Json | null
          template_id?: string | null
        }
        Update: {
          column_config?: Json | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          filter_criteria?: Json | null
          id?: string
          last_run_at?: string | null
          name?: string
          sort_criteria?: Json | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      service: {
        Row: {
          base_price: number | null
          category: string[]
          description: string | null
          id: string
          name: string
        }
        Insert: {
          base_price?: number | null
          category: string[]
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          base_price?: number | null
          category?: string[]
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tax_records: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          invoice_id: string | null
          jurisdiction: string | null
          month: number | null
          quarter: number | null
          tax_amount: number
          tax_category: string
          tax_rate: number
          tax_year: number
          taxable_amount: number
          transaction_date: string
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          jurisdiction?: string | null
          month?: number | null
          quarter?: number | null
          tax_amount: number
          tax_category: string
          tax_rate: number
          tax_year: number
          taxable_amount: number
          transaction_date: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          jurisdiction?: string | null
          month?: number | null
          quarter?: number | null
          tax_amount?: number
          tax_category?: string
          tax_rate?: number
          tax_year?: number
          taxable_amount?: number
          transaction_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_records_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_records_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          activity_type: string
          billable: boolean | null
          billing_rate: number | null
          booking_id: string
          created_at: string | null
          description: string | null
          duration: unknown | null
          employee_id: string
          end_time: string | null
          id: string
          phase_id: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          activity_type: string
          billable?: boolean | null
          billing_rate?: number | null
          booking_id: string
          created_at?: string | null
          description?: string | null
          duration?: unknown | null
          employee_id: string
          end_time?: string | null
          id?: string
          phase_id?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          activity_type?: string
          billable?: boolean | null
          billing_rate?: number | null
          booking_id?: string
          created_at?: string | null
          description?: string | null
          duration?: unknown | null
          employee_id?: string
          end_time?: string | null
          id?: string
          phase_id?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          firstName: string | null
          hire_date: string | null
          id: string
          is_active: boolean | null
          is_admin: boolean | null
          lastName: string | null
          password_hash: string | null
          phone: string | null
          points: number | null
          position: string | null
          referral_code: string | null
          referral_credits: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          specialties: Json | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          firstName?: string | null
          hire_date?: string | null
          id: string
          is_active?: boolean | null
          is_admin?: boolean | null
          lastName?: string | null
          password_hash?: string | null
          phone?: string | null
          points?: number | null
          position?: string | null
          referral_code?: string | null
          referral_credits?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          specialties?: Json | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          firstName?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          is_admin?: boolean | null
          lastName?: string | null
          password_hash?: string | null
          phone?: string | null
          points?: number | null
          position?: string | null
          referral_code?: string | null
          referral_credits?: number | null
          role?: Database["public"]["Enums"]["user_role"] | null
          specialties?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_service_category: {
        Args: { new_cat: string }
        Returns: string
      }
      get_service_categories: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
    }
    Enums: {
      role_type: "Customer" | "Employee"
      user_role:
        | "customer"
        | "employee"
        | "admin_assist"
        | "Customer"
        | "Employee"
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
      role_type: ["Customer", "Employee"],
      user_role: [
        "customer",
        "employee",
        "admin_assist",
        "Customer",
        "Employee",
      ],
    },
  },
} as const
