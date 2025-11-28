"use client"

import { FolderOpen, Zap, ArrowRight, FileCode2, GitBranch, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WelcomeScreenProps {
  onAddRepository: () => void
}

export function WelcomeScreen({ onAddRepository }: WelcomeScreenProps) {
  return (
    <div className="h-full flex items-center justify-center bg-background p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Welcome to BMAD Mission Control</h1>
          <p className="text-muted-foreground text-lg">
            Your command center for managing BMAD-powered development workflows
          </p>
        </div>

        {/* Getting Started Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Get Started
            </CardTitle>
            <CardDescription>Add a repository or folder that uses the BMAD method to begin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button size="lg" className="w-full gap-2" onClick={onAddRepository}>
              <FolderOpen className="w-4 h-4" />
              Add Repository
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Select a folder containing a BMAD project to load its workflow status
            </p>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium">1. Add Project</h3>
                <p className="text-sm text-muted-foreground">Point to any folder with BMAD installed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileCode2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium">2. Auto-Detect</h3>
                <p className="text-sm text-muted-foreground">App reads workflow-status.yaml automatically</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium">3. Track Progress</h3>
                <p className="text-sm text-muted-foreground">Visualize and manage your development workflow</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="font-medium text-center">What you can do</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              "Switch between multiple BMAD projects",
              "Track Discovery, Planning, Solutioning phases",
              "Manage Sprint Planning and Implementation",
              "View epics, stories, and workflow steps",
              "Access documentation and outputs",
              "Run workflows from the command center",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
