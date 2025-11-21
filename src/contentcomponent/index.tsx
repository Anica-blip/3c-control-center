const handleSavePost = async (postData: Omit<ContentPost, 'id' | 'createdDate'> & { id?: string }) => {
  try {
    setIsSaving(true);
    
    // Check if this is an UPDATE (editing existing post) or INSERT (new post)
    if (postData.id) {
      // ✅ EDITING EXISTING POST - Use UPDATE
      console.log('Updating existing post with id:', postData.id);
      
      const updatedPost = await supabaseAPI.updateContentPost(postData.id, postData);
      
      // Update local state
      setSavedPosts(prev => prev.map(post => 
        post.id === postData.id ? updatedPost : post
      ));
      
      // Clear editing state
      setEditingPost(null);
      
      alert('Content updated successfully!');
      
    } else {
      // ✅ NEW POST - Use INSERT
      console.log('Creating new post');
      
      const savedPost = await supabaseAPI.saveContentPost(postData);
      
      // Update local state
      setSavedPosts(prev => [savedPost, ...prev]);
      
      alert('Content saved successfully to Supabase database!');
    }
    
    // Clear template after saving
    clearLoadedTemplate();
    
  } catch (error) {
    console.error('Save failed:', error);
    alert('Failed to save content. Please try again.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
  } finally {
    setIsSaving(false);
  }
};
