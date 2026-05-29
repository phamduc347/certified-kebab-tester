import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt || prompt.trim() === "") {
      return new Response(JSON.stringify({ error: "Kein Prompt angegeben." }), {
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

    // Call stable v1 version of Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
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
