import { NextResponse } from "next/server";
import { openai, resolveFunctionChain } from "@/lib/openai";
import { appointmentTools } from "@/lib/tools";
import { systemInstructions } from "@/lib/systemPrompt";

export async function POST(request) {
  try {
    const { message, responseId } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const input = [{ role: "user", content: message }];

    const initialResponse = await openai.responses.create({
      previous_response_id: responseId || null,
      model: "gpt-4o-mini",
      instructions: systemInstructions,
      input,
      stream: false,
      temperature: 0.7,
      tools: appointmentTools,
      tool_choice: "auto",
      max_output_tokens: 500
    });

    const { message: finalMessage, responseId: finalId } = await resolveFunctionChain({
      response: initialResponse,
      tools: appointmentTools
    });

    return NextResponse.json({
      content: finalMessage,
      responseId: finalId,
      usage: initialResponse.usage
    });
  } catch (error) {
    console.error("❌ Chat API error:", error);
    return NextResponse.json(
      { content: "⚠️ Sorry, something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
