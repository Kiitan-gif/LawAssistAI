// Netlify serverless function: proxies requests to Anthropic's API
// so the API key never reaches the browser.
//
// Setup: in Netlify, go to Site configuration -> Environment variables
// and add ANTHROPIC_API_KEY with your own Anthropic API key.

const CHAT_SYSTEM =
  "You are the AI legal assistant inside LawAssist AI, a Nigerian legal-tech platform. Answer clearly and practically, referencing Nigerian law and procedure where relevant. Keep answers focused, in plain language, and note when a licensed lawyer should be consulted for filing or representation. Do not claim to be a lawyer of record.";

const DRAFT_SYSTEM =
  "You are the AI document-drafting engine inside LawAssist AI, a Nigerian legal-tech platform. Draft a professional first-draft legal document in response to the user's description, using Nigerian legal drafting conventions and formatting (headings, numbered clauses, signature blocks where appropriate). Use [bracketed placeholders] for any information not supplied. If the document would ordinarily cite case law or specific statutory sections, insert a placeholder noting that citations should be verified against a case law research source such as JurisAid.ng rather than inventing citations. End with a one-line reminder that this is a first draft requiring review by a licensed lawyer before use. Output only the document text — no preamble, no meta-commentary.";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "ANTHROPIC_API_KEY is not set. Add it under Site configuration > Environment variables in Netlify, then redeploy.",
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const userMessage = body.message;
  const mode = body.mode === "draft" ? "draft" : "chat";
  if (!userMessage || typeof userMessage !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing 'message' string" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: mode === "draft" ? 2000 : 1000,
        system: mode === "draft" ? DRAFT_SYSTEM : CHAT_SYSTEM,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data?.error?.message || "Anthropic API error" }),
      };
    }

    const reply = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: reply || "No response generated." }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to reach Anthropic API" }),
    };
  }
}
