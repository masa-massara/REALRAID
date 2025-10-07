import { NextResponse } from "next/server";
import { validateWordWithAI } from "@/app/lib/openAI";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const word = typeof body?.word === "string" ? body.word.trim() : "";

    if (!word) {
      return NextResponse.json(
        { valid: false, reason: "判定する単語が入力されていません" },
        { status: 400 }
      );
    }

    const result = await validateWordWithAI(word);
    return NextResponse.json(result, { status: result.valid ? 200 : 422 });
  } catch (error) {
    console.error("validate-word API error", error);
    return NextResponse.json(
      { valid: false, reason: "回答の判定中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
