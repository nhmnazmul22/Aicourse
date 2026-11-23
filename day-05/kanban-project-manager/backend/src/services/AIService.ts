import { BoardColumn, type IBoardColumn } from "../models/BoardColumn";
import { Card, type ICard } from "../models/Card";
import { Project, type IProject } from "../models/Project";
import { env } from "../config/env";
import { z } from "zod";

const CardUpdateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("add"),
    columnId: z.string(),
    title: z.string(),
    details: z.string().optional(),
  }),
  z.object({
    type: z.literal("edit"),
    cardId: z.string(),
    title: z.string().optional(),
    details: z.string().optional(),
  }),
  z.object({
    type: z.literal("delete"),
    cardId: z.string(),
  }),
  z.object({
    type: z.literal("move"),
    cardId: z.string(),
    targetColumnId: z.string(),
    targetIndex: z.number(),
  }),
]);

const AIResponseSchema = z.object({
  response: z.string(),
  updates: z.array(CardUpdateSchema).optional(),
});

export type AIUpdate = z.infer<typeof CardUpdateSchema>;
export type AIResponse = z.infer<typeof AIResponseSchema>;

export class AIService {
  private readonly model = "openai/gpt-oss-120b";
  private readonly baseUrl = "https://openrouter.ai/api/v1/chat/completions";

  async handleMessage(
    userId: string,
    message: string,
    history: { role: "user" | "assistant"; content: string }[],
    board: { projects: IProject[]; columns: IBoardColumn[]; cards: ICard[] }
  ): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(board);
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
      { role: "user" as const, content: message },
    ];

    const responseText = await this.callOpenRouter(messages);

    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      throw new Error("Invalid AI output");
    }

    const parsed = AIResponseSchema.safeParse(parsedResponse);

    if (!parsed.success) {
      throw new Error(`Invalid AI output: ${parsed.error.message}`);
    }

    const { response: text, updates } = parsed.data;
    const appliedUpdates: AIUpdate[] = [];

    if (updates) {
      for (const update of updates) {
        if (update.type === "add") {
          await this.executeAddCard(update);
        } else if (update.type === "edit") {
          await this.executeEditCard(update);
        } else if (update.type === "delete") {
          await this.executeDeleteCard(update);
        } else if (update.type === "move") {
          await this.executeMoveCard(update);
        }
        appliedUpdates.push(update);
      }
    }

    return { response: text, updates: appliedUpdates };
  }

  private buildSystemPrompt(board: { projects: IProject[]; columns: IBoardColumn[]; cards: ICard[] }): string {
    const projectList = board.projects.map((p) => `- ${p.name} (id: ${p._id})`).join("\n") || "None";
    const columnList = board.columns.map((c) => `- ${c.name} (id: ${c._id}, project: ${c.projectId})`).join("\n") || "None";
    const cardList = board.cards.map((c) => `- "${c.title}" (id: ${c._id}, column: ${c.columnId})`).join("\n") || "None";

    return `You are an AI assistant for a Kanban project management board. You can create, edit, delete, and move cards.

Current board state:
Projects:
${projectList}

Columns:
${columnList}

Cards:
${cardList}

When the user asks you to create, edit, delete, or move cards, respond with a JSON object matching this schema:
{
  "response": "A natural language response to the user",
  "updates": [
    { "type": "add", "columnId": "<column id>", "title": "<card title>", "details": "<optional details>" },
    { "type": "edit", "cardId": "<card id>", "title": "<optional new title>", "details": "<optional new details>" },
    { "type": "delete", "cardId": "<card id>" },
    { "type": "move", "cardId": "<card id>", "targetColumnId": "<target column id>", "targetIndex": <number> }
  ]
}

Only suggest updates that reference existing IDs from the board state above. Be concise and helpful. If no board changes are needed, set updates to an empty array or omit it.`;
  }

  private async callOpenRouter(messages: { role: string; content: string }[]): Promise<string> {
    if (!env.OPEN_ROUTER_KEY) {
      throw new Error("OPEN_ROUTER_KEY is not configured");
    }

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPEN_ROUTER_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3001",
        "X-Title": "Kanban Project Manager",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0].message.content;
  }

  async testConnection(): Promise<string> {
    const response = await this.callOpenRouter([
      { role: "user", content: "2+2" },
    ]);
    if (!response.includes("4")) {
      throw new Error(`Unexpected OpenRouter response: ${response}`);
    }
    return response;
  }

  private async executeAddCard(update: Extract<AIUpdate, { type: "add" }>): Promise<void> {
    await Card.create({
      title: update.title,
      details: update.details || "",
      columnId: update.columnId,
      position: 0,
    });
  }

  private async executeEditCard(update: Extract<AIUpdate, { type: "edit" }>): Promise<void> {
    const updateData: Record<string, string> = {};
    if (update.title) updateData.title = update.title;
    if (update.details !== undefined) updateData.details = update.details;
    if (Object.keys(updateData).length > 0) {
      await Card.findByIdAndUpdate(update.cardId, updateData, { new: true });
    }
  }

  private async executeDeleteCard(update: Extract<AIUpdate, { type: "delete" }>): Promise<void> {
    await Card.findByIdAndDelete(update.cardId);
  }

  private async executeMoveCard(update: Extract<AIUpdate, { type: "move" }>): Promise<void> {
    await Card.findByIdAndUpdate(
      update.cardId,
      { columnId: update.targetColumnId, position: update.targetIndex },
      { new: true }
    );
  }
}

export const aiService = new AIService();
