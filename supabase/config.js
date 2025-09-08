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

// Personas API
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
        .insert({ ...personaData, created_by: userId, is_active: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting persona:', error);
      throw error;
    }
  },

  async updatePersona(id, personaData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase
        .from('personas')
        .update(personaData)
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
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting persona:', error);
      throw error;
    }
  }
};

// Keywords API
export const keywordsAPI = {
  async fetchKeywords() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching keywords:', error);
      return [];
    }
  },

  async keywordExists(keyword, excludeId = null) {
    if (!supabase) return false;
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
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking keyword existence:', error);
      return false;
    }
  },

  async insertKeyword(keywordData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      const { data, error } = await supabase
        .from('keywords')
        .insert({
          keyword: keywordData.keyword,
          added_by: keywordData.addedBy,
          date_added: keywordData.dateAdded,
          created_by: userId,
          is_active: true
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting keyword:', error);
      throw error;
    }
  },

  async updateKeyword(id, keywordData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase
        .from('keywords')
        .update({
          keyword: keywordData.keyword,
          added_by: keywordData.addedBy,
          date_added: keywordData.dateAdded
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating keyword:', error);
      throw error;
    }
  },

  async deleteKeyword(id) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { error } = await supabase
        .from('keywords')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting keyword:', error);
      throw error;
    }
  }
};

// Tags API
export const tagsAPI = {
  async fetchTags() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },

  async tagExists(tag, excludeId = null) {
    if (!supabase) return false;
    try {
      let query = supabase
        .from('tags')
        .select('id')
        .eq('tag', tag.trim())
        .eq('is_active', true);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking tag existence:', error);
      return false;
    }
  },

  async insertTag(tagData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      const { data, error } = await supabase
        .from('tags')
        .insert({ ...tagData, created_by: userId, is_active: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting tag:', error);
      throw error;
    }
  },

  async insertManyTags(tagsArray) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      const tagsWithMeta = tagsArray.map(tag => ({
        ...tag,
        created_by: userId,
        is_active: true
      }));
      
      const { data, error } = await supabase
        .from('tags')
        .insert(tagsWithMeta)
        .select();
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error bulk inserting tags:', error);
      throw error;
    }
  },

  async updateTag(id, tagData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase
        .from('tags')
        .update(tagData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  },

  async deleteTag(id) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { error } = await supabase
        .from('tags')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  }
};

// Intel API
export const intelAPI = {
  async fetchIntel() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('intel_entries')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching intel entries:', error);
      return [];
    }
  },

  async insertIntel(intelData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      const { data, error } = await supabase
        .from('intel_entries')
        .insert({
          priority_level: intelData.priorityLevel,
          insight_entry: intelData.insightEntry,
          persona: intelData.persona,
          audience_segment: intelData.audienceSegment,
          audio_file_url: intelData.audioFileUrl || null,
          audio_filename: intelData.audioFilename || null,
          user_id: userId,
          created_by: userId,
          is_active: true
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting intel entry:', error);
      throw error;
    }
  },

  async updateIntel(id, intelData) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase
        .from('intel_entries')
        .update({
          priority_level: intelData.priorityLevel,
          insight_entry: intelData.insightEntry,
          persona: intelData.persona,
          audience_segment: intelData.audienceSegment,
          audio_file_url: intelData.audioFileUrl,
          audio_filename: intelData.audioFilename
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating intel entry:', error);
      throw error;
    }
  },

  async deleteIntel(id) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { error } = await supabase
        .from('intel_entries')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting intel entry:', error);
      throw error;
    }
  },

  // Audio file upload
  async uploadAudioFile(file, fileName) {
    if (!supabase) throw new Error('Supabase not configured');
    try {
      const { data, error } = await supabase.storage
        .from('intel-audio')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('intel-audio')
        .getPublicUrl(fileName);
      
      return { path: data.path, fullPath: data.fullPath, publicUrl };
    } catch (error) {
      console.error('Audio upload error:', error);
      throw error;
    }
  }
};

export default supabase;
