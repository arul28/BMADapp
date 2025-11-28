"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SidebarPanel = "agents" | "docs" | "terminal" | "chat" | "settings" | null

interface SlideSidebarProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
  icon?: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function SlideSidebar({
  isOpen,
  onClose,
  children,
  title,
  icon,
  defaultWidth = 500,
  minWidth = 320,
  maxWidth = 1200,
}: SlideSidebarProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return

      const sidebarRect = sidebarRef.current.getBoundingClientRect()
      const newWidth = sidebarRect.right - e.clientX

      // If dragged to very small width, close the sidebar
      if (newWidth < minWidth - 100) {
        setIsResizing(false)
        onClose()
        return
      }

      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth)
      setWidth(clampedWidth)
    },
    [isResizing, minWidth, maxWidth, onClose],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "ew-resize"
      document.body.style.userSelect = "none"
    } else {
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // Reset width when opening
  useEffect(() => {
    if (isOpen) {
      setWidth(defaultWidth)
    }
  }, [isOpen, defaultWidth])

  if (!isOpen) {
    return null
  }

  return (
    <div
      ref={sidebarRef}
      className="relative h-full bg-sidebar border-l border-border flex-shrink-0 flex flex-col"
      style={{ width }}
    >
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize z-20 flex items-center justify-center",
          "hover:bg-primary/20 transition-colors",
          isResizing && "bg-primary/30",
        )}
        onMouseDown={handleMouseDown}
      >
        <div
          className={cn(
            "flex flex-col gap-0.5 transition-opacity",
            "opacity-30 hover:opacity-100",
            isResizing && "opacity-100",
          )}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Header */}
      <div className="pl-5 pr-4 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-semibold text-lg">{title}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
