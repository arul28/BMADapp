import { NextResponse } from "next/server"
import { clearPersistedRepo, persistActiveRepo, RepoPathError, validateRepo } from "@/lib/server/repo-health"

export async function POST(request: Request) {
  const { repoPath, displayName } = await request.json().catch(() => ({ repoPath: "" }))

  if (!repoPath || typeof repoPath !== "string") {
    return NextResponse.json({ error: "repoPath is required" }, { status: 400 })
  }

  try {
    const validation = await validateRepo(repoPath, typeof displayName === "string" ? displayName : undefined)

    if (validation.status === "unhealthy") {
      const state = await clearPersistedRepo(validation.repoPath)
      return NextResponse.json({ ...validation, state }, { status: 422 })
    }

    const state = await persistActiveRepo(validation)
    return NextResponse.json({ ...validation, state })
  } catch (error) {
    if (error instanceof RepoPathError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.statusCode })
    }
    return NextResponse.json({ error: "Unable to persist repository" }, { status: 500 })
  }
}
