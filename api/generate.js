export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const { instructions, text } = await request.json();

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
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are MilesAI. Generate a structured teacher reference response based on the assignment and homework text.",
          },
          {
            role: "user",
            content: `Assignment Instructions: ${instructions}\nHomework Text: ${text}`,
          }
        ],
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify({ result: data.choices?.[0]?.message?.content || "No response" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: "Server error",
      details: err.message,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
