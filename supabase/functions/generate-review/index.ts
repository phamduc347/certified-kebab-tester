import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function sanitizeInput(text: string): string {
  if (!text) return "";
  
  // Truncate to a reasonable limit (500 characters)
  let sanitized = text.slice(0, 500).trim();
  
  // List of forbidden patterns that suggest prompt injection
  const forbiddenPatterns = [
    /ignore\s+all\s+previous/i,
    /ignore\s+instructions/i,
    /ignoriere\s+(alle\s+)?regeln/i,
    /ignoriere\s+(alle\s+)?anweisungen/i,
    /system\s*prompt/i,
    /developer\s*prompt/i,
    /tue\s+so\s+als\s+ob/i,
    /acting\s+as/i,
    /you\s+are\s+now/i,
    /du\s+bist\s+jetzt/i
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error("Ungültige Eingabe erkannt (Sicherheitsrichtlinie).");
    }
  }

  return sanitized;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const rawBulletPoints = body.bulletPoints || body.prompt || "";
    
    if (!rawBulletPoints || rawBulletPoints.trim() === "") {
      return new Response(JSON.stringify({ error: "Keine Stichpunkte angegeben." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let bulletPoints: string;
    try {
      bulletPoints = sanitizeInput(rawBulletPoints);
    } catch (sanitizeError) {
      return new Response(JSON.stringify({ error: sanitizeError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Gemini API-Key fehlt auf dem Server." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemInstructionText = `Du schreibst einen kurzen Reviewkommentar für eine Dönerbewertung.

Regeln:
• Gib ausschließlich den fertigen Kommentar zurück.
• Keine Einleitung, keine Erklärungen, keine Anführungszeichen.
• Maximal 1000 Zeichen.
• Stil: kurz, prägnant, trocken, leicht humorvoll, intelligent, nicht cringe.
• Keine Emojis.
• Natürlich klingende Alltagssprache.
• Kein übertriebener Slang.
• Keine Wiederholungen.
• Erwähne nur Aspekte, die in den Stichpunkten des Nutzers tatsächlich angegeben wurden.
• Keine erfundenen Details.
• Wenn ein Stichpunkt leer ist, darf dieser Aspekt im Kommentar nicht erwähnt werden.
• Der Kommentar soll wie von einer echten Person wirken.

Struktur:
1. Kurzer Gesamteindruck.
2. Konkrete Beobachtungen ausschließlich basierend auf den Stichpunkten.
3. Abschluss mit trockener oder nüchterner Pointe.`;

    const userText = `Stichpunkte:\n- ${bulletPoints.replace(/\n/g, '\n- ')}`;

    // Call v1beta version of Gemini API using systemInstruction
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userText }] }],
          systemInstruction: {
            parts: [{ text: systemInstructionText }]
          }
        })
      }
    );

    const data = await response.json();
    
    // Check if Gemini API returned an error
    if (data.error) {
      throw new Error(`Gemini-Fehler: ${data.error.message || JSON.stringify(data.error)}`);
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!generatedText) {
      throw new Error("Gemini hat keine Antwort zurückgegeben (Antwort-Candidates-Array ist leer).");
    }

    return new Response(JSON.stringify({ text: generatedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
