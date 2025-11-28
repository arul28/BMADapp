"use client"

import { useState } from "react"
import { ChevronDown, FolderOpen, Plus, Trash2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BmadRepository } from "@/lib/repository-store"

interface RepositoryPickerProps {
  repositories: BmadRepository[]
  activeRepository: BmadRepository | null
  onSelectRepository: (repo: BmadRepository) => void
  onAddRepository: (name: string, path: string) => void
  onRemoveRepository: (id: string) => void
}

export function RepositoryPicker({
  repositories,
  activeRepository,
  onSelectRepository,
  onAddRepository,
  onRemoveRepository,
}: RepositoryPickerProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newRepoName, setNewRepoName] = useState("")
  const [newRepoPath, setNewRepoPath] = useState("")
  const [pathError, setPathError] = useState<string | null>(null)

  const handleAddRepository = () => {
    if (!newRepoName.trim() || !newRepoPath.trim()) {
      setPathError("Please enter both name and path")
      return
    }
    onAddRepository(newRepoName.trim(), newRepoPath.trim())
    setNewRepoName("")
    setNewRepoPath("")
    setPathError(null)
    setAddDialogOpen(false)
  }

  const handleBrowseFolder = () => {
    // In a real Electron/Tauri app, this would open a native folder picker
    // For demo, simulate selecting a folder
    const mockPath = `/Users/demo/projects/${newRepoName || "my-project"}`
    setNewRepoPath(mockPath)
    setPathError(null)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[200px] justify-between bg-transparent">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <span className="truncate max-w-[140px]">{activeRepository?.name || "Select Repository"}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px]">
          {repositories.length === 0 ? (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">No repositories added yet</div>
          ) : (
            repositories.map((repo) => (
              <DropdownMenuItem
                key={repo.id}
                className="flex items-center justify-between group"
                onClick={() => onSelectRepository(repo)}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {activeRepository?.id === repo.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                  {activeRepository?.id !== repo.id && <div className="w-4" />}
                  <div className="min-w-0">
                    <div className="font-medium truncate">{repo.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{repo.path}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!repo.isInitialized && <AlertCircle className="w-4 h-4 text-amber-500" title="Not initialized" />}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveRepository(repo.id)
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Repository
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add BMAD Repository</DialogTitle>
            <DialogDescription>
              Add a folder or repository that uses the BMAD method. The app will check for BMAD installation and
              workflow status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="repo-name">Project Name</Label>
              <Input
                id="repo-name"
                placeholder="My Project"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repo-path">Folder Path</Label>
              <div className="flex gap-2">
                <Input
                  id="repo-path"
                  placeholder="/path/to/project"
                  value={newRepoPath}
                  onChange={(e) => {
                    setNewRepoPath(e.target.value)
                    setPathError(null)
                  }}
                  className="flex-1"
                />
                <Button variant="outline" onClick={handleBrowseFolder}>
                  Browse
                </Button>
              </div>
              {pathError && <p className="text-sm text-destructive">{pathError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRepository}>Add Repository</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
