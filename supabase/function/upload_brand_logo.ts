// /functions/upload_brand_logo.ts
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { v4 as uuidv4 } from "npm:uuid@9.0.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceKey);

/**
 * Helper: extracts the user’s UUID from the JWT.
 * Returns `null` if the token is missing or malformed.
 */
function getUserId(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // `sub` is the UUID of the user in Supabase Auth JWTs
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/** Edge Runtime handler */
Deno.serve(async (req: Request) => {
  // ---- 1️⃣ Parse multipart form data ----
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response(
      JSON.stringify({ error: "Content-Type must be multipart/form-data" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const form = await req.formData();
  const file = form.get("logo");
  if (!(file instanceof File)) {
    return new Response(
      JSON.stringify({ error: "Missing file field `logo`" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // ---- 2️⃣ Authenticate the caller ----
  const userId = getUserId(req);
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Invalid or missing Authorization header" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // ---- 3️⃣ Prepare bucket and file path ----
  const bucket = "brand-assets";
  const fileId = uuidv4(); // unique prefix to avoid collisions
  const extension = file.name.split(".").pop() ?? "";
  const fileName = `${fileId}_${file.name}`;
  const filePath = `${fileName}`; // stored directly under the bucket root

  // Ensure bucket exists (idempotent)
  const { error: bucketError } = await supabase.storage.createBucket(bucket, {
    public: false, // keep private; we’ll generate a signed URL
    allowedMimeTypes: ["image/png", "image/jpeg", "image/svg+xml"],
  });
  // ignore error if bucket already exists
  if (bucketError && bucketError.code !== "duplicate_bucket") {
    return new Response(
      JSON.stringify({ error: "Bucket creation failed", details: bucketError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // ---- 4️⃣ Upload the file ----
  const { error: uploadError } = await supabase.storage.from(bucket).upload(
    filePath,
    file,
    { upsert: false, contentType: file.type },
  );

  if (uploadError) {
    return new Response(
      JSON.stringify({ error: "Upload failed", details: uploadError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // ---- 5️⃣ Generate a short‑lived signed URL (optional) ----
  const { data: signedUrl } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 60 * 24); // 24‑hour link

  // ---- 6️⃣ Insert metadata into `brand_logos` ----
  const { data: logo, error: insertError } = await supabase
    .from("brand_logos")
    .insert({
      name: file.name.replace(/\.[^.]+$/, ""), // strip extension for display
      type: extension.toUpperCase(),
      file_path: filePath,
      file_url: signedUrl?.signedUrl ?? null,
      file_size: file.size.toString(),
      bucket_name: bucket,
      created_by: userId, // <-- UUID, matches column type
      is_active: true,
    })
    .select()
    .single();

  if (insertError) {
    // Cleanup the uploaded file if DB insert failed
    await supabase.storage.from(bucket).remove([filePath]);
    return new Response(
      JSON.stringify({ error: "DB insert failed", details: insertError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  // ---- 7️⃣ Respond with the new row (so the UI can show it) ----
  return new Response(JSON.stringify(logo), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
