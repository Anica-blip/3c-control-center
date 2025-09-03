import { createClient } from "npm:@supabase/supabase-js@2.44.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const guidelineData = await req.json();
    
    if (!guidelineData.title || !guidelineData.content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const { data, error } = await supabase
      .from('brand_guidelines')
      .insert({
        section: guidelineData.section || 'general',
        title: guidelineData.title,
        content: guidelineData.content,
        type: guidelineData.type || 'General Guidelines',
        status: 'Active',
        version_number: 1
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
});
