"use client"

import { useState, useMemo } from "react"
import {
  FileText,
  Search,
  ExternalLink,
  Filter,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  RefreshCw,
  Lightbulb,
  FileCheck,
  Building,
  TestTube,
  Rocket,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SlideSidebar } from "./slide-sidebar"
import { VERSIC_DOCS, type DocFile } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"

interface DocsManagerProps {
  open: boolean
  onClose: () => void
}

type DocTypeFilter =
  | "all"
  | "brainstorm"
  | "research"
  | "brief"
  | "epic"
  | "sprint-status"
  | "story"
  | "prd"
  | "ux"
  | "tech-spec"
  | "template"
  | "output"
  | "config"
  | "checklist"

const TYPE_COLORS: Record<string, string> = {
  brainstorm: "bg-yellow-500/20 text-yellow-400",
  research: "bg-cyan-500/20 text-cyan-400",
  brief: "bg-blue-500/20 text-blue-400",
  epic: "bg-purple-500/20 text-purple-400",
  "sprint-status": "bg-amber-500/20 text-amber-400",
  story: "bg-blue-500/20 text-blue-400",
  prd: "bg-green-500/20 text-green-400",
  ux: "bg-pink-500/20 text-pink-400",
  "tech-spec": "bg-cyan-500/20 text-cyan-400",
  template: "bg-indigo-500/20 text-indigo-400",
  output: "bg-emerald-500/20 text-emerald-400",
  config: "bg-orange-500/20 text-orange-400",
  checklist: "bg-yellow-500/20 text-yellow-400",
}

const TYPE_ICONS: Record<string, typeof FileText> = {
  brainstorm: Lightbulb,
  research: Search,
  brief: FileText,
  prd: FileText,
  ux: FileText,
  "tech-spec": Building,
  checklist: FileCheck,
  output: Rocket,
  "sprint-status": TestTube,
}

export function DocsManager({ open, onClose }: DocsManagerProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<DocTypeFilter>("all")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["doc-stories-2", "doc-stories-10"]))

  const filteredDocs = useMemo(() => {
    const filterDoc = (doc: DocFile): boolean => {
      const matchesSearch =
        doc.filename.toLowerCase().includes(search.toLowerCase()) ||
        doc.path.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || doc.type === typeFilter
      return matchesSearch && matchesType
    }

    const flattenAndFilter = (docs: DocFile[]): DocFile[] => {
      return docs.filter((doc) => {
        if (filterDoc(doc)) return true
        if (doc.children) {
          return doc.children.some((child) => filterDoc(child) || child.children?.some(filterDoc))
        }
        return false
      })
    }

    return flattenAndFilter(VERSIC_DOCS)
  }, [search, typeFilter])

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)
  }

  const renderDocItem = (doc: DocFile, depth = 0) => {
    const hasChildren = doc.children && doc.children.length > 0
    const isExpanded = expandedFolders.has(doc.id)
    const DocIcon = TYPE_ICONS[doc.type] || FileText

    return (
      <div key={doc.id}>
        <div
          className={cn(
            "p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer",
            depth > 0 && "ml-4",
          )}
          onClick={() => (hasChildren ? toggleFolder(doc.id) : undefined)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )
                ) : (
                  <DocIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
                {hasChildren && <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                <span className="text-sm font-medium truncate">{doc.filename}</span>
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded capitalize flex-shrink-0",
                    TYPE_COLORS[doc.type] || "bg-secondary text-muted-foreground",
                  )}
                >
                  {doc.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-mono truncate ml-6">{doc.path}</p>
              <p className="text-xs text-muted-foreground mt-1 ml-6">Updated {formatDate(doc.updatedAt)}</p>
            </div>
            {!hasChildren && (
              <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">{doc.children!.map((child) => renderDocItem(child, depth + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <SlideSidebar
      isOpen={open}
      onClose={onClose}
      title="Docs"
      icon={<FileText className="w-5 h-5" />}
      defaultWidth={500}
      minWidth={400}
      maxWidth={1200}
    >
      <div className="flex flex-col h-full">
        {/* Fixed header section */}
        <div className="p-4 pl-5 space-y-3 border-b border-border flex-shrink-0">
          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search docs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  {typeFilter === "all" ? "All Types" : typeFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTypeFilter("all")}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("brainstorm")}>Brainstorm</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("research")}>Research</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("brief")}>Product Brief</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("prd")}>PRD</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("checklist")}>Validation Reports</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("ux")}>UX Spec</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("tech-spec")}>Architecture/Tech Spec</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("epic")}>Epics</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("sprint-status")}>Sprint Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("story")}>Stories</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTypeFilter("output")}>Implementation Outputs</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Watching: /devDocs</span>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs">
              <RefreshCw className="w-3 h-3" />
              Live
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 pl-5">
          {filteredDocs.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">No documents found</div>
          ) : (
            <div className="space-y-2">{filteredDocs.map((doc) => renderDocItem(doc))}</div>
          )}
        </div>
      </div>
    </SlideSidebar>
  )
}
