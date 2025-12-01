import type { PersistedRepoRecord, RepositoryState } from "./repo-types"

export interface BmadRepository {
  id: string
  name: string
  path: string
  artifacts: string[]
  validatedAt: string
  lastActiveAt: string
}

export function toBmadRepository(record: PersistedRepoRecord): BmadRepository {
  const segments = record.repoPath.split(/[/\\]/).filter(Boolean)
  const derivedName = segments[segments.length - 1] || record.repoPath
  const name = record.displayName?.trim() || derivedName
  return {
    id: record.repoPath,
    name,
    path: record.repoPath,
    artifacts: record.artifacts,
    validatedAt: record.validatedAt,
    lastActiveAt: record.lastActiveAt,
  }
}

export function toRepositoryList(state: RepositoryState): BmadRepository[] {
  const list: BmadRepository[] = []

  if (state.active) {
    list.push(toBmadRepository(state.active))
  }

  for (const record of state.recent) {
    const alreadyAdded = list.some((repo) => repo.path === record.repoPath)
    if (!alreadyAdded) {
      list.push(toBmadRepository(record))
    }
  }

  return list
}
