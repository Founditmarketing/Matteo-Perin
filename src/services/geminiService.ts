// The Google Generative AI SDK logic has been migrated securely to the Vercel backend (`api/chat.js`).
// This service now acts as an API client to securely communicate with our own backend.

export const getGeminiModel = (clientContext?: string) => {
    return {
        generateContent: async (prompt: string) => {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    clientContext: clientContext
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP Error ${response.status}`);
            }

            const data = await response.json();
            
            // Reconstruct the response structure expected by the DigitalConcierge component
            return {
                response: {
                    text: () => data.text
                }
            };
        }
    };
};
