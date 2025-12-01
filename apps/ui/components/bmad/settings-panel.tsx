"use client"

import { useState } from "react"
import { Plus, Trash2, Check, ExternalLink, Settings, Terminal, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SlideSidebar } from "./slide-sidebar"
import { TERMINAL_AGENTS, type TerminalAgent } from "./terminal-manager"
import type { Provider } from "@/lib/bmad-data"
import { cn } from "@/lib/utils"

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
  providers: Provider[]
  setProviders: (providers: Provider[]) => void
  defaultTerminalAgent: TerminalAgent
  setDefaultTerminalAgent: (agent: TerminalAgent) => void
}

export function SettingsPanel({
  open,
  onClose,
  providers,
  setProviders,
  defaultTerminalAgent,
  setDefaultTerminalAgent,
}: SettingsPanelProps) {
  const [newProvider, setNewProvider] = useState<Partial<Provider>>({
    name: "",
    type: "openai",
    apiKey: "",
    baseUrl: "",
  })

  const handleAddProvider = () => {
    if (!newProvider.name || !newProvider.apiKey) return

    const provider: Provider = {
      id: `provider-${Date.now()}`,
      name: newProvider.name,
      type: newProvider.type as Provider["type"],
      apiKey: newProvider.apiKey,
      baseUrl: newProvider.baseUrl,
      isActive: providers.length === 0,
    }

    setProviders([...providers, provider])
    setNewProvider({ name: "", type: "openai", apiKey: "", baseUrl: "" })
  }

  const handleSetActive = (id: string) => {
    setProviders(
      providers.map((p) => ({
        ...p,
        isActive: p.id === id,
      })),
    )
  }

  const handleDeleteProvider = (id: string) => {
    const updatedProviders = providers.filter((p) => p.id !== id)
    if (updatedProviders.length > 0 && !updatedProviders.some((p) => p.isActive)) {
      updatedProviders[0].isActive = true
    }
    setProviders(updatedProviders)
  }

  return (
    <SlideSidebar
      isOpen={open}
      onClose={onClose}
      title="Settings"
      icon={<Settings className="w-5 h-5" />}
      defaultWidth={500}
      minWidth={400}
      maxWidth={700}
    >
      <ScrollArea className="h-full">
        <div className="p-6 pl-8 space-y-8">
          <section>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Terminal AI Agent
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose the default AI coding agent to launch when opening terminal sessions for workflows.
            </p>

            <div className="space-y-2">
              {TERMINAL_AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setDefaultTerminalAgent(agent.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                    defaultTerminalAgent === agent.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {agent.id === "none" ? (
                      <Terminal className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Bot className="w-5 h-5 text-primary" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-muted-foreground">{agent.description}</div>
                      {agent.command && (
                        <code className="text-xs text-muted-foreground/70 font-mono">$ {agent.command}</code>
                      )}
                    </div>
                  </div>
                  {defaultTerminalAgent === agent.id && (
                    <span className="text-xs text-primary flex items-center gap-1">
                      <Check className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Provider Management */}
          <section>
            <h3 className="text-sm font-semibold mb-4">AI Providers</h3>

            {/* Existing providers */}
            {providers.length > 0 && (
              <div className="space-y-2 mb-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      provider.isActive ? "border-primary bg-primary/5" : "border-border bg-card",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-xs font-medium uppercase">
                        {provider.type.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{provider.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{provider.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {provider.isActive ? (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => handleSetActive(provider.id)}>
                          Set Active
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteProvider(provider.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new provider form */}
            <div className="p-4 rounded-lg border border-dashed border-border bg-card/50 space-y-4">
              <h4 className="text-sm font-medium">Add Provider</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-name">Name</Label>
                  <Input
                    id="provider-name"
                    placeholder="My Provider"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider-type">Type</Label>
                  <Select
                    value={newProvider.type}
                    onValueChange={(value) => setNewProvider({ ...newProvider, type: value as Provider["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="ollama">Ollama</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={newProvider.apiKey}
                  onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                />
              </div>

              {(newProvider.type === "ollama" || newProvider.type === "custom") && (
                <div className="space-y-2">
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input
                    id="base-url"
                    placeholder="http://localhost:11434"
                    value={newProvider.baseUrl}
                    onChange={(e) => setNewProvider({ ...newProvider, baseUrl: e.target.value })}
                  />
                </div>
              )}

              <Button
                onClick={handleAddProvider}
                disabled={!newProvider.name || !newProvider.apiKey}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className="text-sm font-semibold mb-4">About BMAD</h3>
            <p className="text-sm text-muted-foreground">
              BMAD (Breakthrough Method of Agile AI-Driven Development) is an agent-based methodology for AI-powered
              software development workflows.
            </p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <a href="https://github.com/bmad-method" target="_blank" rel="noopener noreferrer">
                Learn more <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          </section>
        </div>
      </ScrollArea>
    </SlideSidebar>
  )
}
