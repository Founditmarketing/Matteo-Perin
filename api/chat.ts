import { GoogleGenerativeAI } from "@google/generative-ai";

// NOTE: This catalog is intentionally inlined and self-contained. Vercel's ESM
// serverless runtime does not bundle files outside the /api directory, so importing
// from ../src/constants fails at runtime (ERR_MODULE_NOT_FOUND). Keep the ids in
// sync with src/constants.ts PRODUCTS. Only the fields the AI needs are included.
const CATALOG = [
  { id: 1, title: 'Spring Look 01', category: 'Travel / Leisure', price: 4200, link: '/collection/1', description: 'Tuscan vegetable-tanned leather. 48-hour capacity. Solid brass hardware. Engineered for the departure.' },
  { id: 2, title: 'Spring Look 02', category: 'Outerwear', price: 3850, link: '/collection/2', description: 'Goat suede. Horn buttons. Silk-blend lining. Transitions effortlessly from city streets to alpine retreats.' },
  { id: 3, title: 'Spring Look 03', category: 'Accessories', price: 1250, link: '/collection/3', description: 'Hand-stitched construction. Signature edge painting. An evening essential.' },
  { id: 4, title: 'Spring Look 04', category: 'Tailoring', price: 2100, link: '/collection/4', description: 'Biella-sourced cashmere. Unstructured. Warmth without weight. Available for commission.' },
  { id: 5, title: 'Spring Look 05', category: 'Couture', price: 650, link: '/collection/5', description: 'Japanese acetate. Titanium hardware. Clarity and protection.' },
  { id: 6, title: 'Spring Look 06', category: 'Couture', price: 4500, link: '/collection/6', description: 'Pure Tussah silk. Hand-draped. A lesson in fluid architecture.' },
  { id: 7, title: 'Spring Look 07', category: 'Travel / Tailoring', price: 3200, link: '/collection/7', description: 'Compact efficiency. Fits beneath the seat of any commercial aircraft.' },
  { id: 8, title: 'Spring Look 08', category: 'Footwear', price: 1850, link: '/collection/8', description: 'Goodyear welted. Hand-painted cognac patina. A foundation for the wardrobe.' },
  { id: 9, title: 'Spring Look 09', category: 'Outerwear', price: 5200, link: '/collection/9', description: 'Tuscan lambskin. Reversible. The ultimate defense against the cold.' },
  { id: 10, title: 'Spring Look 10', category: 'Outerwear', price: 4800, link: '/collection/10', description: 'Suri Alpaca blend. Dramatic lapels. A silhouette that commands the room.' },
  { id: 11, title: 'Spring Look 11', category: 'Tailoring', price: 450, link: '/collection/11', description: 'Wild Amazonian Peccary. Unlined for tactile precision. Hand-sewn in Naples.' },
  { id: 12, title: 'Spring Look 12', category: 'Business', price: 1850, link: '/collection/12', description: 'Vegetable-tanned bridle leather. Retractable handle. Architecturally rigid.' },
  { id: 13, title: 'Spring Look 13', category: 'Knitwear', price: 1200, link: '/collection/13', description: '4-ply Scottish cashmere. Chunky rib. The foundation of a winter wardrobe.' },
  { id: 14, title: 'Bespoke Crocodile Jacket', category: 'Exotics', price: 25000, link: '/bespoke-crocodile-jacket', description: "Crafted from hand-selected Nile or Porosus crocodile, each piece is finished with a hand-developed patina and shaped over 100+ hours of artisanal work. Offered exclusively by commission." },
];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("No Gemini API key found in server variables.");
      return res.status(500).json({ error: "Server Configuration Error: Missing API Key" });
    }

    const { prompt, clientContext } = req.body;

    const genAI = new GoogleGenerativeAI(apiKey);

    const catalogString = JSON.stringify(CATALOG);

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

  } catch (error: any) {
    console.error("Vercel Function Error (Gemini):", error);
    return res.status(500).json({ error: error.message || "Failed to generate AI response." });
  }
}
