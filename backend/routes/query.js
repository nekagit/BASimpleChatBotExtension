import express from "express";
import { queryLocalLLM } from "../utils/llmUtils.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const question = req.body.question;
  if (!question) {
    return res.status(400).send("Question is required");
  }
  try {
    const answer = await queryLocalLLM(question);
    res.json({ answer });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

export default router;
