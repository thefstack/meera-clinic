import { NextResponse } from "next/server";
import { openai, resolveFunctionChain } from "@/lib/openai";
import { appointmentTools } from "@/lib/tools";
import { systemInstructions } from "@/lib/systemPrompt";

export async function POST(request) {
  try {
    const { message, responseId, doctorId, doctorName, doctorSpecialty} = await request.json();
    console.log("Received request:", { message, responseId, doctorId });

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }


    const input = [{ role: "user", content: message }];

    // Build system prompt dynamically if doctor id is provided
    let dynamicSystemPrompt = systemInstructions;
    if (doctorId) {
  dynamicSystemPrompt += `

IMPORTANT RULE:
Doctor ID: ${doctorId}.
Doctor Name: ${doctorName}.
Doctor Specialty: ${doctorSpecialty}.
- You are booking an appointment ONLY with this doctor (Doctor ID: {{doctorId}}).
- Do NOT suggest, mention, or compare with any other doctors or specialties.
- If the patient asks for another doctor, DO NOT apologize or mention that you cannot access them.
  Instead, politely redirect them to the current doctor.
`;
}

    const initialResponse = await openai.responses.create({
      previous_response_id: responseId || null,
      model: "gpt-4o-mini",
      instructions: dynamicSystemPrompt,
      input,
      stream: false,
      temperature: 0.7,
      tools: appointmentTools,
      tool_choice: "auto",
      max_output_tokens: 500
    });

    const { message: finalMessage, responseId: finalId } = await resolveFunctionChain({
      response: initialResponse,
      tools: appointmentTools,
      fixedDoctorId: doctorId,
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
