export type RepoHealthStatus = "healthy" | "unhealthy"

export type RepoHealthResult =
  | {
      status: "healthy"
      repoPath: string
      artifacts: string[]
      validatedAt: string
      displayName?: string
      configPath: string
      outputFolder?: string
    }
  | {
      status: "unhealthy"
      repoPath: string
      missing: string[]
      validatedAt: string
      displayName?: string
      configPath?: string
      outputFolder?: string
    }

export type PersistedRepoRecord = {
  repoPath: string
  artifacts: string[]
  validatedAt: string
  lastActiveAt: string
  displayName?: string
}

export type RepositoryState = {
  active: PersistedRepoRecord | null
  recent: PersistedRepoRecord[]
}
