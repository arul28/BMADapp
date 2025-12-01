"use client"

import { AlertCircle, Terminal, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { BmadRepository } from "@/lib/repository-store"

interface InitRequiredScreenProps {
  repository: BmadRepository
  onRunInit: () => void
  onOpenTerminal: () => void
}

export function InitRequiredScreen({ repository, onRunInit, onOpenTerminal }: InitRequiredScreenProps) {
  return (
    <div className="h-full flex items-center justify-center bg-background p-8">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <CardTitle>Initialize BMAD Workflow</CardTitle>
          <CardDescription>
            BMAD is installed in <span className="font-mono text-foreground">{repository.name}</span>, but the workflow
            hasn't been initialized yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Run the initialization command to create workflow-status.yaml and set up your project:
            </p>
            <code className="block bg-background rounded px-3 py-2 text-sm font-mono">bmad init</code>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full gap-2" onClick={onRunInit}>
              <Terminal className="w-4 h-4" />
              Run bmad init
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={onOpenTerminal}>
              Open Terminal
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This is the first step in the Discovery phase and comes before Brainstorming.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
