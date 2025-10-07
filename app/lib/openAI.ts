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

const wordValidationSchema = {
  name: "word_validation_schema",
  schema: {
    type: "object",
    properties: {
      valid: { type: "boolean" },
      reason: {
        type: "string",
        description:
          "短い説明。invalid のときにユーザーへ表示されるメッセージ。",
      },
      meaning: {
        type: "string",
        description:
          "単語が有効な場合の簡潔な意味説明。無効な場合は空文字列。",
      },
    },
    required: ["valid", "reason", "meaning"],
    additionalProperties: false,
  },
} as const;

export const validateWordWithAI = async (
  word: string
): Promise<{ valid: boolean; reason: string; meaning: string }> => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "あなたは日本語の単語判定アシスタントです。ユーザーから渡された文字列が日本語の自然な単語（名詞・動詞・形容詞・擬音語など）として成立しているかを判断し、JSONで回答してください。有効な単語であれば、その単語の意味を短い日本語で説明してください。スラングや造語でも一般的に理解できるものであれば有効とし、ひらがな・カタカナ・漢字以外の文字が多い場合や単語として成立していない場合は無効としてください。",
      },
      {
        role: "user",
        content: word,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: wordValidationSchema,
    },
  });

  const rawContent = completion.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("単語の判定に失敗しました");
  }

  const payload = JSON.parse(rawContent) as {
    valid?: unknown;
    reason?: unknown;
    meaning?: unknown;
  };

  const valid = typeof payload.valid === "boolean" ? payload.valid : false;
  const reason = typeof payload.reason === "string" ? payload.reason : "";
  const meaning = typeof payload.meaning === "string" ? payload.meaning : "";

  return {
    valid,
    reason: reason || (valid ? "" : "この単語は無効と判定されました"),
    meaning: valid ? meaning : "",
  };
};
