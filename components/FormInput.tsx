"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
}

export function FormInput({ label, error, icon, className, id, ...props }: FormInputProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`
  
  return (
    <div className="space-y-1.5 sm:space-y-2">
      {label && (
        <Label htmlFor={inputId} className="text-xs sm:text-sm font-medium text-gray-700">{label}</Label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
            {icon}
          </div>
        )}
        <Input
          id={inputId}
          className={cn(
            "min-h-[44px] sm:min-h-[48px] text-sm sm:text-base", // Touch-friendly height and readable text
            error && "border-destructive", 
            icon && "pl-9 sm:pl-10",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs sm:text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}

