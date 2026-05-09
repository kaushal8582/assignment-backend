const GEMINI_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent";

function describeBlockedOrEmpty(body) {
    const blockReason = body?.promptFeedback?.blockReason;
    if (blockReason) {
        return `Request blocked (${blockReason}). Try shorter or different topic content.`;
    }
    const fr = body?.candidates?.[0]?.finishReason;
    if (fr && fr !== "STOP") {
        return `AI stopped (${fr}). Try again or adjust the topic content.`;
    }
    return "AI returned empty content";
}

/**
 * @param {string} prompt
 * @returns {Promise<{ ok: true, text: string } | { ok: false, status: number, message: string }>}
 */
async function generateGeminiText(prompt) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

    if (!apiKey) {
        return { ok: false, status: 503, message: "AI assistant is not configured" };
    }

    const url = GEMINI_URL.replace("{model}", model);

    let res;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": apiKey,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });
    } catch {
        return { ok: false, status: 503, message: "Could not reach AI service" };
    }

    let body;
    try {
        body = await res.json();
    } catch {
        return { ok: false, status: 502, message: "Invalid response from AI service" };
    }

    if (!res.ok) {
        const googleMsg =
            body?.error?.message && typeof body.error.message === "string"
                ? body.error.message
                : "AI request failed";
        const status = res.status >= 400 && res.status < 600 ? res.status : 502;
        const outbound = status >= 500 ? 502 : status;
        return { ok: false, status: outbound, message: googleMsg };
    }

    const parts = body?.candidates?.[0]?.content?.parts;
    const text =
        Array.isArray(parts) ? parts.map((p) => (typeof p.text === "string" ? p.text : "")).join("") : "";

    if (!text.trim()) {
        return { ok: false, status: 502, message: describeBlockedOrEmpty(body) };
    }

    return { ok: true, text: text.trim() };
}

module.exports = { generateGeminiText };
