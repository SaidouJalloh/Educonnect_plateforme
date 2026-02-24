import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es EduBot, un assistant d'orientation scolaire et professionnelle spécialisé pour les étudiants en Afrique francophone.
Tu aides les étudiants à :
- Trouver les meilleures universités et formations en Afrique et à l'étranger
- Obtenir des bourses d'études (nationales et internationales)
- Choisir leur filière selon leurs intérêts et le marché du travail africain
- Préparer leurs dossiers d'admission et candidatures
- Naviguer les opportunités professionnelles en Afrique

Tu réponds toujours en français (sauf si l'utilisateur écrit en anglais ou arabe, tu réponds dans sa langue).
Sois concis, bienveillant, et donne des informations pratiques et actionnables.
Lorsque tu mentionnes des programmes ou universités, donne des détails concrets (pays, niveau requis, délais si connus).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY manquante");
      return new Response(
        JSON.stringify({ error: "Configuration serveur incomplète" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const previousMessages = context?.previousMessages || [];

    // Format Gemini : "user" et "model" (pas "assistant")
    const history = previousMessages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        ...history,
        { role: "user", parts: [{ text: message }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const aiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      console.error("Gemini API error:", err);
      throw new Error("Erreur Gemini : " + err);
    }

    const data = await aiResponse.json();
    const response =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Désolé, je n'ai pas pu générer une réponse. Réessaie.";

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("EduBot error:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
