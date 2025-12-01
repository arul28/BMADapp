"use client"

import { ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BreadcrumbProps {
  items: { label: string; onClick?: () => void }[]
  onBack?: () => void
}

export function Breadcrumb({ items, onBack }: BreadcrumbProps) {
  if (items.length <= 1) return null

  return (
    <div className="flex items-center gap-2 mb-4">
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </Button>
      )}
      <div className="flex items-center gap-1 text-sm">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            <button
              onClick={item.onClick}
              disabled={!item.onClick}
              className={
                item.onClick
                  ? "text-muted-foreground hover:text-foreground transition-colors"
                  : "text-foreground font-medium"
              }
            >
              {item.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
