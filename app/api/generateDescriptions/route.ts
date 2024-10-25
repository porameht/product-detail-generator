import Together from "together-ai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const together = new Together();

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

  let descriptions;
  let productNames;
  let rawResponse;
  try {
    const res = await together.chat.completions.create({
      model,
      temperature: 0.2,
      stream: false,
      messages: [
        {
          role: "system",
          content: `
          You are a helpful product description generator that ONLY responses with JSON.
          `,
        },
        {
          role: "user",
          // @ts-expect-error need to fix the TypeScript library type
          content: [
            {
              type: "text",
              text: `Given this product image, return JSON with product names and Amazon-like ${length} sales product descriptions in a ${tone} tone for each specified language. The languages are: ${languages
                .map((language) => `"${language}"`)
                .join(", ")}

              Return a JSON object in the following shape: 
              {
                "productNames": {[language: string]: string},
                "descriptions": [{language: string, description: string},...]
              }

              For each language, please ensure the product name and description are detailed, culturally appropriate, and use language-specific terminology where relevant.

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

    rawResponse = res.choices[0].message?.content;
    const parsedResponse = JSON.parse(rawResponse || "{}");
    productNames = parsedResponse.productNames;
    descriptions = parsedResponse.descriptions;
    console.log({ rawResponse, productNames, descriptions });
  } catch (error) {
    const productResponseSchema = z.object({
      productNames: z.record(z.string()).describe("the names of the product in different languages"),
      descriptions: z.array(
        z.object({
          language: z.string().describe("the language specified"),
          description: z
            .string()
            .describe("the description of the product in the language specified"),
        })
      ),
    });
    const jsonSchema = zodToJsonSchema(
      productResponseSchema,
      "productResponseSchema"
    );

    const extract = await together.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Parse out the valid JSON from this text. Only answer in JSON.",
        },
        {
          role: "user",
          content: rawResponse || "",
        },
      ],
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      // @ts-expect-error need to type the schema format
      response_format: { type: "json_object", schema: jsonSchema },
    });

    const parsedExtract = JSON.parse(extract?.choices?.[0]?.message?.content || "{}");
    productNames = parsedExtract.productNames;
    descriptions = parsedExtract.descriptions;
    console.log(error);
  }

  return Response.json({ productNames, descriptions });
}

export const runtime = "edge";
