import z from "zod/v3";
import llm from "../../config/interviewLlm/llm.js";
import summaryPrompt from "../../prompts/interviewPrompts/summaryPrompt.js";

export const summaryAgent = async (data) => {
  const schema = z.object({
    overallScore: z.number(),
    summary: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    recommendations: z.array(z.string()),
  });
  try {
    const prompt = summaryPrompt(data);
    const structuredLlm = llm.withStructuredOutput(schema);
    const response = await structuredLlm.invoke(prompt);
    const cleaned = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.log(error, "Summary Agent Parse Error");
    throw new Error("Failed to generate summary");
  }
};
