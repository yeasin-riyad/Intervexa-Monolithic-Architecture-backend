import { feedbackAgent } from "../../agents/interviewAgents/feedback.agent.js";
import { summaryAgent } from "../../agents/interviewAgents/summary.agent.js";
import { interviewAgent } from "../../agents/interviewAgents/interview.agent.js";


export async function interviewNode(state){
    const questions= await interviewAgent({
        role:state.role,
        type:state.type,
        useResume:state.useResume,
        resume:state.resume
    });

    return {
        questions
    }

}

export async function feedbackNode(state){
    const feedback= await feedbackAgent({
        question:state.question,
        answer:state.answer,
        difficulty:state.difficulty
    });

    return {
        feedback
    }
}

export async function summaryNode(state){
    const report= await summaryAgent({
        role:state.role,
        type:state.type,
        questions:state.questions
    })

    return {
        report
    }

}