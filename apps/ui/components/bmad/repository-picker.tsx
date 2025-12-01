"use client"

import Link from "next/link"
import { ChevronDown, FolderOpen, Plus, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { BmadRepository } from "@/lib/repository-store"

interface RepositoryPickerProps {
  repositories: BmadRepository[]
  activeRepository: BmadRepository | null
  onSelectRepository: (repo: BmadRepository) => void
  onRemoveRepository: (id: string) => void
}

export function RepositoryPicker({
  repositories,
  activeRepository,
  onSelectRepository,
  onRemoveRepository,
}: RepositoryPickerProps) {
  return (
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
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">No projects added yet</div>
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
              </DropdownMenuItem>
            ))
          )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="repo/" className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add project
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
