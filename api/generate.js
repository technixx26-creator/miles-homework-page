export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { instructions, text } = await req.json();

    if (!instructions || !text) {
      return new Response(JSON.stringify({ error: "Missing input fields." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OpenAI API key." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a teacher reference answer generator.",
          },
          {
            role: "user",
            content: `Assignment: ${instructions}\n\nHomework Text: ${text}`,
          },
        ],
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify({ output: data.choices?.[0]?.message?.content || "No response" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error", details: err.toString() }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
