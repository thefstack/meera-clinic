import { appointmentTools } from "@/lib/tools";

export default async function handler(req, res) {
  try {
    const { functionName, functionArgument } = req.body;


    const response = await openai.responses.create({
      previous_response_id: responseId || null,
      model: "gpt-4o-mini",
      instructions: `functionName: ${functionName}.
functionArgument: ${functionArgument}.
- call the function with the provided arguments.
- Do NOT suggest, mention, or compare with any other functions or arguments.`,
      input,
      stream: false,
      temperature: 0.7,
      tools: appointmentTools,
      tool_choice: "auto",
      max_output_tokens: 500
    });

  console.log("Function call response:", response.output[0]);

    return NextResponse.json({
      output: response.output[0]
    });
  } catch (err) {
    console.error("resolveFunctionChain error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
}
