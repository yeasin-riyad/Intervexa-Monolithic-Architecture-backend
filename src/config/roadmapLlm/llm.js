import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";

dotenv.config();

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY_SECOND,
  model: "openai/gpt-oss-120b",
  temperature: 0,
});

export default llm;