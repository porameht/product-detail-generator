import OpenAI from "openai";
import { z } from "zod";

const client = new OpenAI();

export async function POST(req: Request) {
  const json = await req.json();
  const result = z
    .object({
      imageUrl: z.string(),
      languages: z.array(z.string()),
      model: z.string(),
      length: z.string(),
      tone: z.string(),
    })
    .safeParse(json);

  if (result.error) {
    return new Response(result.error.message, { status: 422 });
  }

  const { languages, imageUrl, model, length, tone } = result.data;

  try {
    const res = await client.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `You are a helpful product description generator that ONLY responses with JSON.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Given this product image, return JSON of a Amazon-like ${length} sales product description and product name in a ${tone} tone in each of these languages. ${languages
                .map((language) => `"${language}"`)
                .join(", ")}

              Return a JSON object in the following shape: 
              {
                "productNames": {[language: string]: string},
                "descriptions": [{language: string, description: string},...]
              }
              It is very important for my career that you follow these instructions exactly. PLEASE ONLY RETURN JSON, NOTHING ELSE.
              `,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    const rawResponse: string | null = res.choices[0].message?.content;
    const cleanedResponse: string = rawResponse?.replace(/^```json\s*|\s*```$/g, '') || "{}";
    const parsedResponse: {
      productNames: Record<string, string>;
      descriptions: { language: string; description: string }[];
    } = JSON.parse(cleanedResponse || "{}");

    const { productNames, descriptions } = parsedResponse;

    return Response.json({ productNames, descriptions });
  } catch (error) {
    console.error(error);
    return new Response("Error processing request", { status: 500 });
  }
}

export const runtime = "edge";