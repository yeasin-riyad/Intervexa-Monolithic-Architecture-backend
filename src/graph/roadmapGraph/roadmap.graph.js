
import { StateGraph, START, END } from "@langchain/langgraph";
import resourceAgent from "../../agents/roadmapAgents/resource.agent.js";
import roadmapAgent from "../../agents/roadmapAgents/roadmap.agent.js";
import { RoadmapState } from "./roadmap.state.js";

const graph = new StateGraph(RoadmapState)
  // Register nodes
  .addNode("roadmapAgent", roadmapAgent)
  .addNode("resourceAgent", resourceAgent)

  // Define workflow
  .addEdge(START, "roadmapAgent")
  .addEdge("roadmapAgent", "resourceAgent")
  .addEdge("resourceAgent", END)

  // Compile graph
  .compile();

export default graph;
