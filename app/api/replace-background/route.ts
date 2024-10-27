import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { imageUrl, prompt } = await req.json();

  if (!imageUrl || !prompt) {
    return NextResponse.json(
      { success: false, error: "Image URL and prompt are required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch("https://image-generator-service.onrender.com/replace-background", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to replace background");
    }

    const data = await response.json();

    return NextResponse.json({ success: true, imageUrl: data.url });
  } catch (error) {
    console.error("Error replacing background:", error);
    return NextResponse.json(
      { success: false, error: "Failed to replace background" },
      { status: 500 }
    );
  }
}

export const runtime = "edge";
