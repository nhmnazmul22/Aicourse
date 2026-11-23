import { BoardColumn, type IBoardColumn } from "../models/BoardColumn";
import { Card, type ICard } from "../models/Card";
import { Project, type IProject } from "../models/Project";
import { env } from "../config/env";

export type AIAction =
  | { type: "create_card"; projectId: string; columnId: string; title: string; details?: string }
  | { type: "edit_card"; cardId: string; title?: string; details?: string }
  | { type: "move_card"; cardId: string; targetColumnId: string; targetIndex: number }
  | { type: "none" };

export type AIResponse = {
  text: string;
  actions: AIAction[];
};

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

    const response = await this.callOpenRouter(messages);
    const { text, actions } = this.parseResponse(response);

    const executedActions: AIAction[] = [];
    for (const action of actions) {
      if (action.type === "create_card") {
        await this.executeCreateCard(action);
      } else if (action.type === "edit_card") {
        await this.executeEditCard(action);
      } else if (action.type === "move_card") {
        await this.executeMoveCard(action);
      }
      executedActions.push(action);
    }

    return { text, actions: executedActions };
  }

  private buildSystemPrompt(board: { projects: IProject[]; columns: IBoardColumn[]; cards: ICard[] }): string {
    const projectList = board.projects.map((p) => `- ${p.name} (id: ${p._id})`).join("\n") || "None";
    const columnList = board.columns.map((c) => `- ${c.name} (id: ${c._id}, project: ${c.projectId})`).join("\n") || "None";
    const cardList = board.cards.map((c) => `- "${c.title}" (id: ${c._id}, column: ${c.columnId})`).join("\n") || "None";

    return `You are an AI assistant for a Kanban project management board. You can create, edit, and move cards.

Current board state:
Projects:
${projectList}

Columns:
${columnList}

Cards:
${cardList}

When the user asks you to create, edit, or move cards, respond with actions in this format:
ACTION:create_card|projectId=<id>|columnId=<id>|title=<title>|details=<details>
ACTION:edit_card|cardId=<id>|title=<title>|details=<details>
ACTION:move_card|cardId=<id>|targetColumnId=<id>|targetIndex=<number>
ACTION:none

Only suggest actions that reference existing IDs from the board state above. Be concise and helpful.`;
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

  private parseResponse(text: string): AIResponse {
    const actions: AIAction[] = [];
    let responseText = text;

    const actionLines = text.match(/ACTION:([^\n]+)/g) || [];
    for (const line of actionLines) {
      const action = this.parseActionLine(line);
      if (action) {
        actions.push(action);
      }
      responseText = responseText.replace(line, "").trim();
    }

    if (!responseText) {
      responseText = "I've processed your request.";
    }

    return { text: responseText, actions };
  }

  private parseActionLine(line: string): AIAction | null {
    const parts = line.split("|");
    const header = parts[0];
    const params: Record<string, string> = {};
    for (const part of parts.slice(1)) {
      const eqIdx = part.indexOf("=");
      if (eqIdx > 0) {
        params[part.slice(0, eqIdx)] = part.slice(eqIdx + 1);
      }
    }

    if (header === "ACTION:create_card") {
      return {
        type: "create_card",
        projectId: params["projectId"] || "",
        columnId: params["columnId"] || "",
        title: params["title"] || "",
        details: params["details"] || undefined,
      };
    }
    if (header === "ACTION:edit_card") {
      return {
        type: "edit_card",
        cardId: params["cardId"] || "",
        title: params["title"] || undefined,
        details: params["details"] || undefined,
      };
    }
    if (header === "ACTION:move_card") {
      return {
        type: "move_card",
        cardId: params["cardId"] || "",
        targetColumnId: params["targetColumnId"] || "",
        targetIndex: Number(params["targetIndex"]) || 0,
      };
    }
    return null;
  }

  private async executeCreateCard(action: Extract<AIAction, { type: "create_card" }>): Promise<void> {
    await Card.create({
      title: action.title,
      details: action.details || "",
      columnId: action.columnId,
      position: 0,
    });
  }

  private async executeEditCard(action: Extract<AIAction, { type: "edit_card" }>): Promise<void> {
    const update: Record<string, string> = {};
    if (action.title) update.title = action.title;
    if (action.details !== undefined) update.details = action.details;
    if (Object.keys(update).length > 0) {
      await Card.findByIdAndUpdate(action.cardId, update, { new: true });
    }
  }

  private async executeMoveCard(action: Extract<AIAction, { type: "move_card" }>): Promise<void> {
    await Card.findByIdAndUpdate(
      action.cardId,
      { columnId: action.targetColumnId, position: action.targetIndex },
      { new: true }
    );
  }
}

export const aiService = new AIService();
