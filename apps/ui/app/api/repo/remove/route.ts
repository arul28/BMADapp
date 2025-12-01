import { NextResponse } from "next/server"
import { removeRepo, RepoPathError } from "@/lib/server/repo-health"

export async function POST(request: Request) {
  const { repoPath } = await request.json().catch(() => ({ repoPath: "" }))

  if (!repoPath || typeof repoPath !== "string") {
    return NextResponse.json({ error: "repoPath is required" }, { status: 400 })
  }

  try {
    const state = await removeRepo(repoPath)
    return NextResponse.json({ state })
  } catch (error) {
    if (error instanceof RepoPathError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Unable to remove repository" }, { status: 500 })
  }
}
