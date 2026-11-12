import { Annotation } from "@langchain/langgraph";

export const RoadmapState = Annotation.Root({
    // Target job role
    role: Annotation({
        default: () => "",
    }),

    // Expected salary package
    targetPackage: Annotation({
        default: () => "",
    }),

    // Whether the user uploaded a resume
    useResume: Annotation({
        default: () => false,
    }),

    // Resume analysis data
    resume: Annotation({
        default: () => null,
    }),

    // AI-generated roadmap
    roadmap: Annotation({
        default: () => null,
    }),

    // Error handling
    error: Annotation({
        default: () => null,
    }),
});