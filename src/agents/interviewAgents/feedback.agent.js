import llm from "../../config/interviewLlm/llm.js";
import feedbackPrompt from "../../prompts/interviewPrompts/feedbackPrompt.js";

export const feedbackAgent = async (data) => {
  try {
    const prompt = feedbackPrompt(data);

    const response = await llm.invoke(prompt);
    const cleaned = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.log(error, "Feedback Agent Parse Error");
    throw new Error("Failed to generate feedback");
  }
};
