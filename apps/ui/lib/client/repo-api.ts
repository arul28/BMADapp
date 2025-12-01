export type RepoEndpoint = "validate" | "persist" | "restore" | "remove"

type RepoPayload = {
  repoPath?: string
  displayName?: string
}

export type RepoApiResponse<T = any> = {
  response: Response
  data: T
}

type BmadBridge = {
  repoHealth?: (repoPath: string, displayName?: string) => Promise<any>
  persistRepo?: (repoPath: string, displayName?: string) => Promise<any>
  restoreRepo?: (repoPath?: string) => Promise<any>
  removeRepo?: (repoPath: string) => Promise<any>
  chooseRepo?: () => Promise<string | null>
}

function getBridge(): BmadBridge | null {
  if (typeof window === "undefined") return null
  const candidate = (window as any).bmad as BmadBridge | undefined
  if (!candidate) return null
  return candidate
}

function makeResponse(status: number, body?: any): Response {
  return new Response(body ? JSON.stringify(body) : null, {
    status,
    statusText: status >= 200 && status < 300 ? "OK" : "Error",
    headers: { "Content-Type": "application/json" },
  })
}

export async function callRepoEndpoint<T = any>(endpoint: RepoEndpoint, payload?: RepoPayload): Promise<RepoApiResponse<T>> {
  const bridge = getBridge()
  const isFileProtocol = typeof window !== "undefined" && window.location?.protocol === "file:"
  if (bridge) {
    try {
      let data: any
      let status = 500

      if (endpoint === "validate" && typeof bridge.repoHealth === "function") {
        data = await bridge.repoHealth(payload?.repoPath ?? "", payload?.displayName)
        status = data?.status === "healthy" ? 200 : 422
      } else if (endpoint === "persist" && typeof bridge.persistRepo === "function") {
        data = await bridge.persistRepo(payload?.repoPath ?? "", payload?.displayName)
        status = data?.status === "healthy" ? 200 : 422
      } else if (endpoint === "restore" && typeof bridge.restoreRepo === "function") {
        data = await bridge.restoreRepo(payload?.repoPath)
        status = data?.status === "healthy" ? 200 : data?.status === "unhealthy" ? 422 : 404
      } else if (endpoint === "remove" && typeof bridge.removeRepo === "function") {
        data = await bridge.removeRepo(payload?.repoPath ?? "")
        status = data?.state ? 200 : 400
      }

      if (data) {
        return { response: makeResponse(status), data: data as T }
      }
    } catch (error) {
      return { response: makeResponse(500, { error: (error as Error).message }), data: { error: (error as Error).message } as T }
    }
  }

  if (isFileProtocol) {
    const err = { error: "Desktop bridge unavailable. Restart the desktop app to reload preload scripts." }
    return { response: makeResponse(500, err), data: err as T }
  }

  const response = await fetch(`/api/repo/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  })

  let data: T
  try {
    data = (await response.json()) as T
  } catch {
    data = {} as T
  }

  return { response, data }
}
