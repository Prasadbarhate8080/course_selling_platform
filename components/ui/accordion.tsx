"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
  activeItem: string | null;
  toggleItem: (value: string) => void;
} | null>(null)

const Accordion = ({ children, type = "single", collapsible = true, className }: any) => {
  const [activeItem, setActiveItem] = React.useState<string | null>(null)

  const toggleItem = (value: string) => {
    if (activeItem === value && collapsible) {
      setActiveItem(null)
    } else {
      setActiveItem(value)
    }
  }

  return (
    <AccordionContext.Provider value={{ activeItem, toggleItem }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = ({ children, value, className }: any) => {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { value })
        }
        return child
      })}
    </div>
  )
}

const AccordionTrigger = ({ children, value, className }: any) => {
  const context = React.useContext(AccordionContext)
  if (!context) return null

  const isActive = context.activeItem === value

  return (
    <button
      onClick={() => context.toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between px-6 py-4 transition-all hover:bg-muted/50 text-left",
        isActive && "bg-muted/30",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isActive && "rotate-180"
        )}
      />
    </button>
  )
}

const AccordionContent = ({ children, value, className }: any) => {
  const context = React.useContext(AccordionContext)
  if (!context) return null

  const isActive = context.activeItem === value

  if (!isActive) return null

  return (
    <div
      className={cn(
        "px-6 pb-4 pt-0 text-sm transition-all animate-in fade-in slide-in-from-top-1",
        className
      )}
    >
      {children}
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
