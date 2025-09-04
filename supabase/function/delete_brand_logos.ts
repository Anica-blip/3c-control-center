import { createClient } from "npm:@supabase/supabase-js@2.44.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

Deno.serve(async (req: Request) => {
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing ID parameter' }), { status: 400 });
    }

    // Get logo info before deleting to remove file from storage
    const { data: logoInfo } = await supabase
      .from('brand_logos')
      .select('file_path, bucket_name')
      .eq('id', id)
      .single();

    // Delete from storage if file exists
    if (logoInfo?.file_path && logoInfo?.bucket_name) {
      await supabase.storage
        .from(logoInfo.bucket_name)
        .remove([logoInfo.file_path]);
    }

    // Delete from database
    const { error } = await supabase
      .from('brand_logos')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Logo deleted' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
});
