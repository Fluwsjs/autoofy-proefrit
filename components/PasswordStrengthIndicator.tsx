"use client"

import { useMemo } from "react"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    let score = 0
    if (password.length >= 8) score++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++
    if (password.match(/\d/)) score++
    if (password.match(/[^a-zA-Z\d]/)) score++
    return score
  }, [password])

  const getLabel = () => {
    if (strength === 0) return "Zeer zwak"
    if (strength === 1) return "Zwak"
    if (strength === 2) return "Redelijk"
    if (strength === 3) return "Goed"
    return "Sterk"
  }

  const getColor = () => {
    if (strength <= 1) return "bg-red-500"
    if (strength === 2) return "bg-yellow-500"
    if (strength === 3) return "bg-blue-500"
    return "bg-green-500"
  }

  if (!password) return null

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Wachtwoord sterkte:</span>
        <span
          className={`font-medium ${
            strength >= 3
              ? "text-green-600"
              : strength === 2
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {getLabel()}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${(strength / 4) * 100}%` }}
        />
      </div>
      <ul className="text-xs text-muted-foreground space-y-1 mt-2">
        <li className={password.length >= 8 ? "text-green-600" : ""}>
          {password.length >= 8 ? "✓" : "•"} Minimaal 8 tekens
        </li>
        <li
          className={
            password.match(/[a-z]/) && password.match(/[A-Z]/)
              ? "text-green-600"
              : ""
          }
        >
          {password.match(/[a-z]/) && password.match(/[A-Z]/) ? "✓" : "•"}{" "}
          Hoofdletters en kleine letters
        </li>
        <li className={password.match(/\d/) ? "text-green-600" : ""}>
          {password.match(/\d/) ? "✓" : "•"} Minimaal één cijfer
        </li>
        <li className={password.match(/[^a-zA-Z\d]/) ? "text-green-600" : ""}>
          {password.match(/[^a-zA-Z\d]/) ? "✓" : "•"} Minimaal één speciaal teken
        </li>
      </ul>
    </div>
  )
}

