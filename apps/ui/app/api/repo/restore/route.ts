import { NextResponse } from "next/server"
import { clearPersistedRepo, persistActiveRepo, readPersistedRepo, RepoPathError, validateRepo } from "@/lib/server/repo-health"

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { repoPath?: string }
  const candidatePath = typeof body.repoPath === "string" && body.repoPath.trim().length > 0 ? body.repoPath : undefined

  const persisted = await readPersistedRepo()
  const targetPath = candidatePath ?? persisted.active?.repoPath

  if (!targetPath) {
    return NextResponse.json(
      { status: "unhealthy", message: "No repo to restore", state: persisted },
      { status: 404 },
    )
  }

  try {
    const validation = await validateRepo(targetPath)

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
    return NextResponse.json({ error: "Unable to restore repository" }, { status: 500 })
  }
}
