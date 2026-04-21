export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json();

      // ============================================================
      // ROUTE: SAVE TEMPLATE TO D1
      // ============================================================
      if (body.action === 'save-template') {
        const id = `${body.character}-${body.templateType}-${body.themeLabel}-${Date.now()}`
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-');

        await env.DB.prepare(`
          INSERT INTO templates (id, theme_label, character, brand_voice, template_type, target_audience, platform, structure, guidelines, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
          id,
          body.themeLabel || '',
          body.character || '',
          body.brandVoice || '',
          body.templateType || '',
          body.targetAudience || '',
          body.platform || '',
          body.structure || '',
          body.guidelines || ''
        ).run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // ============================================================
      // ROUTE: SAVE CONTENT TO LIBRARY (upsert by title — no duplicates)
      // ============================================================
      if (body.action === 'save-content') {
        const wordCount = body.content ? body.content.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
        const title = body.title || 'Untitled';

        const existing = await env.DB.prepare(
          `SELECT id FROM content_library WHERE title = ? LIMIT 1`
        ).bind(title).first();

        if (existing) {
          await env.DB.prepare(`
            UPDATE content_library
            SET character = ?, theme_label = ?, template_type = ?, target_audience = ?,
                platform = ?, content = ?, status = ?, word_count = ?
            WHERE id = ?
          `).bind(
            body.character || '',
            body.themeLabel || '',
            body.templateType || '',
            body.targetAudience || '',
            body.platform || '',
            body.content || '',
            body.status || 'Draft',
            wordCount,
            existing.id
          ).run();

          return new Response(JSON.stringify({ success: true, id: existing.id, updated: true }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } else {
          const id = `content-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
          await env.DB.prepare(`
            INSERT INTO content_library (id, title, character, theme_label, template_type, target_audience, platform, content, status, word_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          `).bind(
            id, title,
            body.character || '',
            body.themeLabel || '',
            body.templateType || '',
            body.targetAudience || '',
            body.platform || '',
            body.content || '',
            body.status || 'Draft',
            wordCount
          ).run();

          return new Response(JSON.stringify({ success: true, id, updated: false }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }

      // ============================================================
      // ROUTE: LIST ALL SAVED DOCUMENTS
      // ============================================================
      if (body.action === 'list-documents') {
        const results = await env.DB.prepare(`
          SELECT id, title, character, platform, status, word_count, created_at
          FROM content_library
          ORDER BY created_at DESC
        `).all();

        return new Response(JSON.stringify({ success: true, documents: results.results || [] }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // ============================================================
      // ROUTE: LOAD A DOCUMENT BY ID
      // ============================================================
      if (body.action === 'load-document') {
        const doc = await env.DB.prepare(`
          SELECT * FROM content_library WHERE id = ? LIMIT 1
        `).bind(body.id).first();

        if (!doc) {
          return new Response(JSON.stringify({ success: false, error: 'Document not found' }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        return new Response(JSON.stringify({ success: true, document: doc }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // ============================================================
      // ROUTE: SAVE POST CONTEXT TO D1
      // ============================================================
      if (body.action === 'save-post-context') {
        const id = `post-ctx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        await env.DB.prepare(`
          INSERT INTO post_context (id, title, synopsis, section, character, brand_voice, target_audience, platform, theme_label, template_type, saved_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          id,
          body.title || '',
          body.synopsis || '',
          body.section || '',
          body.character || '',
          body.brandVoice || '',
          body.targetAudience || '',
          body.platform || '',
          body.themeLabel || '',
          body.templateType || ''
        ).run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // ============================================================
      // ROUTE: FETCH URL CONTENT — lets Jan read web pages
      // ============================================================
      if (body.action === 'fetch-url') {
        try {
          const urlResponse = await fetch(body.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; 3C-Jan/1.0)' }
          });
          const html = await urlResponse.text();
          const text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 8000);

          return new Response(JSON.stringify({ success: true, content: text, url: body.url }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, error: 'Could not fetch URL' }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }
      }

      // ============================================================
      // ROUTE: SAVE REFERENCE SAMPLE TO D1
      // ============================================================
      if (body.action === 'save-reference') {
        const id = body.id || `ref-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        await env.DB.prepare(`
          INSERT INTO reference_samples (id, template_id, title, content, character, tags, engagement_notes, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            content = excluded.content,
            character = excluded.character,
            tags = excluded.tags,
            engagement_notes = excluded.engagement_notes
        `).bind(
          id,
          body.templateId || '',
          body.title || '',
          body.content || '',
          body.character || '',
          JSON.stringify(body.tags || []),
          body.engagementNotes || ''
        ).run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // ============================================================
      // ROUTE: GET REFERENCE SAMPLES BY TEMPLATE ID
      // ============================================================
      if (body.action === 'get-references-by-template') {
        const limit = body.limit || 10;

        const results = await env.DB.prepare(`
          SELECT id, template_id, title, content, character, tags, engagement_notes, created_at
          FROM reference_samples
          WHERE template_id = ?
          ORDER BY created_at DESC
          LIMIT ?
        `).bind(body.templateId, limit).all();

        const references = (results.results || []).map((r) => ({
          id: r.id,
          templateId: r.template_id,
          title: r.title,
          content: r.content,
          character: r.character,
          tags: (() => { try { return JSON.parse(r.tags || '[]'); } catch(e) { return []; } })(),
          performance: { engagement: '', notes: r.engagement_notes || '' },
          createdAt: r.created_at
        }));

        return new Response(JSON.stringify({ success: true, references }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // ============================================================
      // ROUTE: FETCH CONTEXT FROM D1 + CALL CLAUDE API (STREAMING)
      // ============================================================
      let disclaimerText = '';
      let platformRulesText = '';
      let templateText = '';

      // Fetch correct disclaimer based on template type
      if (body.templateType) {
        const longFormTypes = ['Blog Posts', 'Newsletter', 'Tutorial Guide', 'Course, Tool', 'Assessment', 'Presentation'];
        const disclaimerId = longFormTypes.includes(body.templateType) ? 'disclaimer-full' : 'disclaimer-short';

        const disclaimerResult = await env.DB.prepare(
          'SELECT content FROM brand_assets WHERE id = ? AND active = 1'
        ).bind(disclaimerId).first();

        if (disclaimerResult) {
          disclaimerText = `\n\nDISCLAIMER TO APPEND (add at end of all documents):\n${disclaimerResult.content}`;
        }
      }

      // Fetch platform rules if platform selected
      if (body.platform) {
        const platformId = body.platform.toLowerCase().replace(/\//g, '-').replace(/ /g, '-') + '-post';

        const platformResult = await env.DB.prepare(
          'SELECT * FROM platform_rules WHERE id = ?'
        ).bind(platformId).first();

        if (platformResult) {
          platformRulesText = `\n\nPLATFORM RULES FOR ${body.platform.toUpperCase()}:
- Max characters: ${platformResult.max_characters}
- Max hashtags: ${platformResult.max_hashtags || 'None'}
- Link behaviour: ${platformResult.link_behaviour}
- Notes: ${platformResult.notes}`;
        }
      }

      // Fetch matching saved template if dropdowns provided
      if (body.themeLabel && body.character) {
        const templateResult = await env.DB.prepare(
          `SELECT structure, guidelines FROM templates
           WHERE character = ? AND theme_label = ?
           ORDER BY created_at DESC
           LIMIT 1`
        ).bind(body.character, body.themeLabel).first();

        if (templateResult) {
          templateText = `\n\nSAVED TEMPLATE FOUND — use this structure:\nStructure: ${templateResult.structure}\nGuidelines: ${templateResult.guidelines}`;
        }
      }

      // ============================================================
      // FETCH BRAND KNOWLEDGE FROM D1 — Jan's permanent memory
      // ============================================================
      let brandKnowledgeText = '';
      try {
        const brandResults = await env.DB.prepare(
          `SELECT title, content FROM brand_assets
           WHERE asset_type = 'brand-knowledge' AND active = 1
           ORDER BY id ASC`
        ).all();

        if (brandResults.results && brandResults.results.length > 0) {
          brandKnowledgeText = '\n\n--- BRAND KNOWLEDGE (permanent reference) ---\n' +
            brandResults.results
              .map(row => `\n${row.title}:\n${row.content}`)
              .join('\n\n');
        }
      } catch (e) {
        console.error('Brand knowledge fetch error:', e.message);
      }

      // Append all D1 context to system prompt
      const enrichedSystem = body.system + brandKnowledgeText + disclaimerText + platformRulesText + templateText;

      // ============================================================
      // SMART MAX_TOKENS — split based on request type
      // Caller can pass body.maxTokens to override (e.g. full document)
      // ============================================================
      const longFormTypes = ['Blog Posts', 'Newsletter', 'Tutorial Guide', 'Course, Tool', 'Assessment', 'Presentation'];
      const isLongForm = body.templateType && longFormTypes.includes(body.templateType);
      const maxTokens = body.maxTokens || (isLongForm ? 4096 : 2048);

      // ============================================================
      // STREAMING — pipe Anthropic SSE directly to client
      // Cloudflare sees bytes flowing immediately — no timeout ever
      // ============================================================
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: maxTokens,
          stream: true,
          system: enrichedSystem,
          messages: body.messages
        })
      });

      // If Anthropic itself returns an error, surface it cleanly
      if (!claudeResponse.ok) {
        const errorData = await claudeResponse.text();
        return new Response(
          JSON.stringify({ error: `Anthropic API error ${claudeResponse.status}: ${errorData}` }),
          {
            status: claudeResponse.status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          }
        );
      }

      // Pipe the SSE stream straight through to the client
      // CF sees bytes arriving immediately — wall-time timeout never triggers
      return new Response(claudeResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
          'X-Accel-Buffering': 'no'
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
