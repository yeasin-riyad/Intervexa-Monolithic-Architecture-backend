import { SystemMessage, HumanMessage } from "@langchain/core/messages";

import llm from "../../config/roadmapLlm/llm.js";
import { roadmapPrompt } from "../../prompts/roadmapPrompt/roadmap.prompt.js";

const roadmapAgent = async (state) => {
    try {
        // 1. Prepare resume data if the user has uploaded a resume
        const resume = state.useResume
            ? {
                  skills: state.resume?.skills || [],
                  missingSkills: state.resume?.missingSkills || [],
                  projects: state.resume?.projects || [],
                  experience: state.resume?.experience || [],
                  score: state.resume?.score || 0,
                  suggestedRole: state.resume?.suggestedRole || "",
                  recommendations: state.resume?.recommendations || [],
              }
            : null;

        // 2. Send roadmap generation request to LLM
        const response = await llm.invoke([
            new SystemMessage(roadmapPrompt),

            new HumanMessage(`
                Target Role: ${state.role}

                Target Package: ${state.targetPackage}

                Resume Available: ${state.useResume ? "Yes" : "No"}

                Resume Data:
                ${JSON.stringify(resume, null, 2)}
            `),
        ]);

        // 3. Extract AI response
        let content = response.content;

        // Handle string or content-block responses
        if (Array.isArray(content)) {
            content = content
                .map((item) => item.text || "")
                .join("");
        }

        if (typeof content !== "string" || !content.trim()) {
            throw new Error("AI returned an empty roadmap response.");
        }

        // 4. Remove Markdown code fences if present
        const cleanedContent = content
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/, "")
            .trim();

        // 5. Parse JSON response
        const roadmap = JSON.parse(cleanedContent);

        // 6. Validate roadmap structure
        if (
            !roadmap.title ||
            !roadmap.targetPackage ||
            !roadmap.duration ||
            !roadmap.level ||
            !Array.isArray(roadmap.modules)
        ) {
            throw new Error("AI returned an invalid roadmap structure.");
        }

        if (roadmap.modules.length < 8 || roadmap.modules.length > 15) {
            throw new Error("Roadmap must contain between 8 and 15 modules.");
        }

        const validLevels = ["Beginner", "Intermediate", "Advanced"];
        const validDifficulties = ["Easy", "Medium", "Hard"];

        if (!validLevels.includes(roadmap.level)) {
            throw new Error(`Invalid roadmap level: ${roadmap.level}`);
        }

        // 7. Validate individual modules
        roadmap.modules.forEach((module, index) => {
            if (
                !module.title ||
                !module.duration ||
                !module.description ||
                !validDifficulties.includes(module.difficulty)
            ) {
                throw new Error(
                    `Invalid roadmap module at position ${index + 1}.`
                );
            }
        });

        // 8. Return roadmap to LangGraph state
        return {
            roadmap,
            error: null,
        };
    } catch (error) {
        console.error("Roadmap Agent Error:", error);

        return {
            roadmap: null,
            error: error.message || "Failed to generate roadmap.",
        };
    }
};

export default roadmapAgent;