import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface JudgeResult {
    correct: boolean;
    points: number;
    feedback: string;
}

export async function judgeSubmission(
    problemDescription: string,
    code: string,
    maxPoints: number
): Promise<JudgeResult> {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
            {
                role: "system",
                content: `You are a strict code judge for a developer challenge platform.
Evaluate the submitted code against the problem description.
Respond ONLY with a JSON object in this exact shape:
{
  "correct": boolean,
  "points": number between 0 and ${maxPoints},
  "feedback": string
}
Award full points only for a correct, complete solution. Award partial points for partially correct solutions. Be concise in feedback (1-2 sentences).`
            },
            {
                role: "user",
                content: `Problem:\n${problemDescription}\n\nSubmission:\n\`\`\`\n${code}\n\`\`\`\n\nMax points available: ${maxPoints}`
            }
        ]
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    return {
        correct: Boolean(parsed.correct),
        points: Math.min(Math.max(0, Number(parsed.points) || 0), maxPoints),
        feedback: String(parsed.feedback || "No feedback provided")
    };
}
