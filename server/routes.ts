import type { Express } from "express";
import type { Server } from "http";
import { generateQuiz, generateFeedback } from "./gemini.js";
import { z } from "zod";

const generateQuizSchema = z.object({
  topic: z.string().min(1).max(200),
  name: z.string().min(1).max(255),
});

const generateFeedbackSchema = z.object({
  topic: z.string(),
  name: z.string().min(1).max(255),
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
          message:
            "Invalid request: topic and name are required (topic: 1-200 characters, name: 1-255 characters)",
        });
      }

      const { topic, name } = parsed.data;

      const result = await generateQuiz(topic, name);

      if ("error" in result && result.error) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
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

      const { topic, name, score, total, answers } = parsed.data;

      const typedAnswers = answers.map((a) => ({
        questionId: a.questionId,
        userAnswer: a.userAnswer,
        correctAnswer: a.correctAnswer,
        question: a.question,
      }));

      const result = await generateFeedback(
        topic,
        name,
        score,
        total,
        typedAnswers
      );

      if ("error" in result && result.error) {
        return res.status(500).json(result);
      }

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "An unexpected error occurred while generating feedback",
      });
    }
  });

  return httpServer;
}
