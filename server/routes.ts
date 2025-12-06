import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateQuiz, generateFeedback } from "./gemini";
import { z } from "zod";

const generateQuizSchema = z.object({
  topic: z.string().min(1).max(200),
});

const generateFeedbackSchema = z.object({
  topic: z.string(),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
  answers: z.array(
    z.object({
      questionId: z.number(),
      userAnswer: z.number().nullable(),
      correctAnswer: z.number(),
      question: z.string(),
    })
  ),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/generate", async (req, res) => {
    try {
      const parsed = generateQuizSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: true,
          message: "Invalid request: topic is required and must be a string (1-200 characters)",
        });
      }

      const { topic } = parsed.data;
      console.log(`Generating quiz for topic: ${topic}`);

      const result = await generateQuiz(topic);

      if ("error" in result && result.error) {
        console.error("Quiz generation failed:", result.message);
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error("Unexpected error in /api/generate:", error);
      return res.status(500).json({
        error: true,
        message: "An unexpected error occurred while generating the quiz",
      });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const parsed = generateFeedbackSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: true,
          message: "Invalid request: missing required fields",
        });
      }

      const { topic, score, total, answers } = parsed.data;
      console.log(`Generating feedback for topic: ${topic}, score: ${score}/${total}`);

      const result = await generateFeedback(topic, score, total, answers);

      if ("error" in result && result.error) {
        console.error("Feedback generation failed:", result.message);
        return res.status(500).json(result);
      }

      console.log("Successfully generated feedback");
      return res.json(result);
    } catch (error) {
      console.error("Unexpected error in /api/feedback:", error);
      return res.status(500).json({
        error: true,
        message: "An unexpected error occurred while generating feedback",
      });
    }
  });

  return httpServer;
}
