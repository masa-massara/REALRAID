"use server";
import OpenAI from "openai";

const projectId = process.env.OPENAI_PROJECT_ID;

if (projectId && !projectId.startsWith("proj_")) {
  delete process.env.OPENAI_PROJECT_ID;
}

const clientOptions: {
  apiKey?: string;
  organization?: string;
  project?: string;
} = {
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
};

if (projectId?.startsWith("proj_")) {
  clientOptions.project = projectId;
}

const openai = new OpenAI(clientOptions);

const themeWordsSchema = {
  name: "theme_words_schema",
  schema: {
    type: "object",
    properties: {
      words: {
        type: "array",
        items: {
          type: "string",
          description: "The words related to the given theme",
        },
      },
    },
    required: ["words"],
    additionalProperties: false,
  },
} as const;

export const ReturnThemeJSONData = async (
  theme: string
): Promise<{ words: string[] } | null> => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "ユーザーに与えられたテーマに基づいて、テーマに関連する単語のJSONデータを生成してください。例: テーマが「ハロウィン」の場合、ハロウィンに関連する単語をJSONデータで返してください。単語は全部で500個以上生成してください。単語はすべてひらがなで生成してください。",
      },
      {
        role: "user",
        content: theme,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: themeWordsSchema,
    },
  });

  const rawContent = completion.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("テーマデータがnullで返ってきました。");
  }

  const themeData = JSON.parse(rawContent) as { words?: unknown };

  if (themeData && Array.isArray(themeData.words)) {
    return themeData as { words: string[] };
  }

  return null;
};
