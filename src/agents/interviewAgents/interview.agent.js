import llm from "../../config/interviewLlm/llm.js";
import hrInterviewPrompt from "../../prompts/interviewPrompts/hrInterviewPrompt.js";
import technicalInterviewPrompt from "../../prompts/interviewPrompts/technicalInterviewPrompt.js";

export const interviewAgent = async (data) => {
  try {
    const prompt =
      data?.type?.toLowerCase() === "hr"
        ? hrInterviewPrompt(data)
        : technicalInterviewPrompt(data);

    const response = await llm.invoke(prompt);
    const cleaned = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.log("Interview Agent Parse Error");
    console.log(error, "Error");
    throw new Error("Failed to generate interview questions");
  }
};
