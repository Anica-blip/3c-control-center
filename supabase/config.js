// Step 3: Create this file as src/supabaseConfig.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Initialize with validation
let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client created successfully');
} else {
  console.error('Missing Supabase environment variables');
}

// Personas API functions
export const personasAPI = {
  async fetchPersonas() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching personas:', error);
      return [];
    }
  },

  async insertPersona(personaData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      const { data, error } = await supabase
        .from('personas')
        .insert({ 
          ...personaData, 
          created_by: userId, 
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting persona:', error);
      throw error;
    }
  },

  async updatePersona(id, updateData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase
        .from('personas')
        .update({ 
          ...updateData, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating persona:', error);
      throw error;
    }
  },

  async deletePersona(id) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { error } = await supabase
        .from('personas')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting persona:', error);
      throw error;
    }
  }
};

export default supabase;
