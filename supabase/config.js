// Step 3: Create this file as supabase/config.js in your repository
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
}; // <- This closing brace was missing

// Keywords API functions
export const keywordsAPI = {
  // Fetch all active keywords
  async fetchKeywords() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching keywords:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Keywords fetch failed:', error);
      throw error;
    }
  },

  // Insert new keyword
  async insertKeyword(keywordData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      // Validate required fields
      if (!keywordData.keyword || keywordData.keyword.trim() === '') {
        throw new Error('Keyword is required');
      }

      const insertData = {
        keyword: keywordData.keyword.trim(),
        added_by: keywordData.addedBy?.trim() || null,
        date_added: keywordData.dateAdded || new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('keywords')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting keyword:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Keyword insert failed:', error);
      throw error;
    }
  },

  // Update existing keyword
  async updateKeyword(id, keywordData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      if (!id) {
        throw new Error('Keyword ID is required for update');
      }

      if (!keywordData.keyword || keywordData.keyword.trim() === '') {
        throw new Error('Keyword is required');
      }

      const updateData = {
        keyword: keywordData.keyword.trim(),
        added_by: keywordData.addedBy?.trim() || null,
        date_added: keywordData.dateAdded || new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('keywords')
        .update(updateData)
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single();

      if (error) {
        console.error('Error updating keyword:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Keyword not found or already deleted');
      }

      return data;
    } catch (error) {
      console.error('Keyword update failed:', error);
      throw error;
    }
  },

  // Soft delete keyword
  async deleteKeyword(id) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      if (!id) {
        throw new Error('Keyword ID is required for deletion');
      }

      const { data, error } = await supabase
        .from('keywords')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('is_active', true)
        .select()
        .single();

      if (error) {
        console.error('Error deleting keyword:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Keyword not found or already deleted');
      }

      return data;
    } catch (error) {
      console.error('Keyword deletion failed:', error);
      throw error;
    }
  },

  // Check if keyword already exists (for validation)
  async keywordExists(keyword, excludeId = null) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      let query = supabase
        .from('keywords')
        .select('id')
        .eq('keyword', keyword.trim())
        .eq('is_active', true);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking keyword existence:', error);
        throw new Error(error.message);
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Keyword existence check failed:', error);
      throw error;
    }
  }
};

export default supabase;
