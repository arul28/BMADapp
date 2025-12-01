"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2, FolderOpen, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { RepoHealthResult, RepositoryState } from "@/lib/repo-types"
import { callRepoEndpoint } from "@/lib/client/repo-api"

type RepoApiPayload = (RepoHealthResult & { state?: RepositoryState; error?: string; message?: string; code?: string }) | {
  error?: string
  message?: string
  code?: string
}

export default function RepoPage() {
  const router = useRouter()
  const folderInputRef = useRef<HTMLInputElement | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [repoPath, setRepoPath] = useState("")
  const [health, setHealth] = useState<RepoHealthResult | null>(null)
  const [artifacts, setArtifacts] = useState<string[]>([])
  const [repoState, setRepoState] = useState<RepositoryState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bridgeAvailable, setBridgeAvailable] = useState<boolean>(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const bridge = (window as any).bmad
    setBridgeAvailable(!!bridge)
    if (!bridge && window.location?.protocol === "file:") {
      setError("Desktop bridge unavailable. Close and relaunch the desktop app to reload preload scripts.")
    } else if (bridge?.preloadInitError) {
      setError(`Desktop bridge failed to load: ${bridge.preloadInitError}`)
    }
  }, [])

  const isHealthPayload = (payload: RepoApiPayload): payload is RepoHealthResult & { state?: RepositoryState } =>
    typeof (payload as any)?.status === "string"

  const handleBrowse = () => {
    const bridge = (typeof window !== "undefined" ? (window as any).bmad : null) as { chooseRepo?: () => Promise<string | null> } | null
    if (bridge?.chooseRepo) {
      bridge
        .chooseRepo()
        .then((selected) => {
          if (selected) setRepoPath(selected)
        })
        .catch(() => {
          folderInputRef.current?.click()
        })
    } else {
      folderInputRef.current?.click()
    }
  }

  const handleFolderSelected: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileAny = file as File & { path?: string; webkitRelativePath?: string }
    if (fileAny.path) {
      setRepoPath(fileAny.path)
      return
    }

    const fallbackName = fileAny.webkitRelativePath?.split("/")[0] || file.name
    setRepoPath(fallbackName ? `/${fallbackName}` : repoPath)
  }

  const handlePersist = async () => {
    const trimmedPath = repoPath.trim()
    const trimmedName = displayName.trim()
    if (!trimmedPath) {
      setError("Enter a repo path to validate")
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { response, data } = await callRepoEndpoint<RepoApiPayload>("persist", {
        repoPath: trimmedPath,
        displayName: trimmedName || undefined,
      })
      const payload = data as RepoApiPayload

      if (isHealthPayload(payload)) {
        setHealth(payload)
        setArtifacts(payload.status === "healthy" ? payload.artifacts ?? [] : [])
        setRepoPath(payload.status === "healthy" ? payload.repoPath : trimmedPath)
        if (payload.state) {
          setRepoState(payload.state)
        }
        if (payload.status === "healthy") {
          const isFileProtocol = typeof window !== "undefined" && window.location?.protocol === "file:"
          if (isFileProtocol) {
            const target = new URL("../index.html", window.location.href)
            window.location.href = target.href
          } else {
            router.push("/")
          }
        }
      } else {
        setHealth(null)
        setArtifacts([])
      }

      if (!response.ok) {
        const message = (payload as any).error ?? (payload as any).message ?? "Validation failed"
        setError(message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed")
      setHealth(null)
      setArtifacts([])
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {!bridgeAvailable && typeof window !== "undefined" && window.location?.protocol === "file:" && (
          <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 p-3 text-sm">
            Desktop bridge unavailable. Close and relaunch the desktop app to reload preload scripts.
          </div>
        )}
        <Card>
          <CardHeader>
            <div className="w-full flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="!mb-1">Add Project</CardTitle>
                <CardDescription>Validate and save a BMAD project by locating <code>bmm/config.yaml</code>.</CardDescription>
              </div>
              <div className="ml-4">
                <Button variant="ghost" onClick={() => router.back()} aria-label="Close dialog">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Label htmlFor="repo-name">Project name (optional)</Label>
              <Input
                id="repo-name"
                placeholder="My Project"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="grid gap-4">
              <Label htmlFor="repo-path">Repository path</Label>
              <div className="flex gap-2">
                <Input
                  id="repo-path"
                  data-testid="repo-picker-input"
                  placeholder="/path/to/bmad-repo"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBrowse}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Browse
                </Button>
              </div>
              <input
                ref={folderInputRef}
                type="file"
                className="hidden"
                webkitdirectory="true"
                multiple
                onChange={handleFolderSelected}
              />
              <div className="flex justify-center pt-2">
                <Button onClick={handlePersist} disabled={loading} data-testid="repo-validate-submit" className="px-8">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Project"}
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            {health?.status === "healthy" && (
              <div className="flex justify-center pt-4" data-testid="repo-valid-indicator">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Repository validated</span>
                </div>
              </div>
            )}
            {health && health.status !== "healthy" && !error && (
              <div className="flex justify-center pt-4" data-testid="repo-invalid-indicator">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-900/20 px-4 py-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4" />
                  <span>Repository needs required files</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
