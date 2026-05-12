import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message } = body;

    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      
      messages: [
        {
          role: "system",
          content: `
You are SmartTutorET AI.

You help students learn step by step.
Explain concepts simply.
Use examples.
          `,
        },

        {
          role: "user",
          content: message,
        },
      ],
    });

    return Response.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}