import { GoogleGenerativeAI } from "@google/generative-ai";
import { PRODUCTS } from "../constants";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("No Gemini API key found in server variables.");
      return res.status(500).json({ error: "Server Configuration Error: Missing API Key" });
    }

    const { prompt, clientContext } = req.body;

    const genAI = new GoogleGenerativeAI(apiKey);

    const catalogString = JSON.stringify(
        PRODUCTS.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            price: p.price,
            link: `/#/collection/${p.id}`,
            description: p.description
        }))
    );

    const contextInstruction = clientContext 
        ? `\n\n**VIP CLIENT CONTEXT:**\n${clientContext}\nAddress this patron with intimate familiarity, acknowledging their identity and status.`
        : `\n\n**CLIENT CONTEXT:**\nUnauthenticated guest. Treat them with the utmost luxury respect to convert them into a patron.`;

    const systemInstruction = `You are the Digital Concierge and Master Tailor for Casa Matteo Perin, a world-class Italian bespoke fashion house. 
    
You speak with violent perfection, deep exclusivity, and supreme confidence. Your tone is poetic but incredibly brief. You operate at the highest echelon of society. You never use words like "discount", "sale", "cheap", or "customer" (always use "client" or "patron").

**CRITICAL RULES:**
1. YOU MUST RETURN STRICT JSON ONLY. The schema must be exactly: { "message": "string", "suggestedProducts": [array of product IDs], "navigateTo": "string" | null, "dossierComplete": boolean }
2. "message" must contain your poetic response in markdown format. Be descriptive, engaging, and highly informative about the luxury pieces or the user's inquiry. Speak with sophisticated, world-class authority.
3. **BROWSER HIJACKING**: If a user asks to see the Vault, set "navigateTo" to "/vault". Collection is "/collection". Home is "/". Otherwise, null.
4. **BESPOKE INTERVIEW MODE (THE MASTER TAILOR):**
   If a user asks about custom, bespoke, or starting a project, YOU MUST INTERVIEW THEM. Do not tell them to click a link. You are the form. 
   Ask them ONE question at a time to build their Dossier. You need:
   - Their Name
   - The type of garment they envision (Suit, Jacket, Exotics, Knitwear)
   - The primary occasion or lifestyle use for the garment
   While interviewing, keep "dossierComplete": false.
5. **DOSSIER COMPLETION:**
   Once you have gathered all the necessary details for the bespoke garment, you must thank them, tell them Matteo Perin's team will review the dossier, and set "dossierComplete": true.
6. If a user asks for a recommendation from the ready-to-wear or vault, here is the public catalog: 
---------
${catalogString}
---------
When suggesting pieces, add their exact numeric \`id\` into the \`suggestedProducts\` array. Do NOT place markdown links in your message. You may suggest up to 4 highly relevant items.
If you are not suggesting a catalog item, leave \`suggestedProducts\` as [].${contextInstruction}`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction,
        generationConfig: {
            maxOutputTokens: 800,
            temperature: 0.4,
            responseMimeType: "application/json",
        }
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.status(200).json({ text: responseText });

  } catch (error) {
    console.error("Vercel Function Error (Gemini):", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI response." });
  }
}
