import { createClient } from "npm:@supabase/supabase-js@2.44.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

Deno.serve(async (req: Request) => {
  if (req.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { id, ...colorData } = await req.json();
    
    if (!id || !colorData.name || !colorData.hex || !colorData.usage) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const hex = colorData.hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const rgbValues = `rgb(${r}, ${g}, ${b})`;

    const { data, error } = await supabase
      .from('brand_colors')
      .update({
        name: colorData.name,
        hex_code: colorData.hex,
        usage: colorData.usage,
        rgb_values: rgbValues
      })
      .eq('id', id)
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
