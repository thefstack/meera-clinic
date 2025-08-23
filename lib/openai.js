// lib/openai.js
import OpenAI from "openai";
import { handleFunctionCall } from "./tools";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

export async function resolveFunctionChain({ response, tools, fixedDoctorId }) {
  console.log("Resolving function chain with response:", response.output);

  let responseId = response.id;
  let aiOutputs = response.output; // could be multiple items

  while (aiOutputs.some(o => o.type === "function_call")) {
    // loop through ALL outputs that are function calls
    for (const aiOutput of aiOutputs) {
      if (aiOutput.type === "function_call") {
        const functionName = aiOutput.name;
        const functionArgs = JSON.parse(aiOutput.arguments || "{}");

        console.log(`➡️ Calling function: ${functionName}`, functionArgs);

       const functionResponse = await handleFunctionCall(functionName, functionArgs, fixedDoctorId);

        // send back result to the model
        const nextResponse = await openai.responses.create({
          previous_response_id: responseId,
          model: "gpt-4o-mini",
          input: [
            {
              type: "function_call_output",
              call_id: aiOutput.call_id,
              output: JSON.stringify(functionResponse)
            }
          ],
          tools,
          store: true,
          tool_choice: "auto"
        });

        responseId = nextResponse.id;
        aiOutputs = nextResponse.output; // update outputs and continue
      }
    }
  }

  // collect final non-function messages
  const finalMessage = aiOutputs
    .filter(o => o.type === "message")
    .map(o => o.content?.[0]?.text)
    .join("\n");

  return {
    message: finalMessage || "✅ Action completed.",
    responseId
  };
}
