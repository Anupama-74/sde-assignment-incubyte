import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"

import { getBootstrappedDatabase } from "@/lib/bootstrap"
import { answerCompensationQuestion } from "@/lib/compensation-questions"
import { parseCompensationQuestionInput } from "@/lib/validation"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const input = parseCompensationQuestionInput({
      question: request.nextUrl.searchParams.get("question") ?? "",
    })
    const db = getBootstrappedDatabase()
    return NextResponse.json(answerCompensationQuestion(db, input.question))
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid question" },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
