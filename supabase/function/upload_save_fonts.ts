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
    const fontData = await req.json();
    
    if (!fontData.name || !fontData.usage) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontData.name.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    const cssImport = `@import url("${googleFontsUrl}");`;
    const fontFamilyCSS = `font-family: "${fontData.name}", ui-sans-serif, system-ui, sans-serif;`;

    const { data, error } = await supabase
      .from('typography_system')
      .insert({
        name: fontData.name,
        category: fontData.category || 'Primary',
        usage: fontData.usage,
        weight_range: fontData.weight || '400-600',
        google_fonts_url: googleFontsUrl,
        css_import: cssImport,
        font_family_css: fontFamilyCSS,
        font_source: 'google',
        status: 'Active'
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
