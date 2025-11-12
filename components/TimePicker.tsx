"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface TimePickerProps {
  label: string
  value: string // Format: "HH:MM"
  onChange: (value: string) => void
  required?: boolean
}

export function TimePicker({ label, value, onChange, required }: TimePickerProps) {
  // Committed values (what's actually saved)
  const [committedHours, setCommittedHours] = useState("09")
  const [committedMinutes, setCommittedMinutes] = useState("00")
  
  // Preview values (what's shown while scrolling, not saved yet)
  const [previewHours, setPreviewHours] = useState("09")
  const [previewMinutes, setPreviewMinutes] = useState("00")
  
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hoursRef = useRef<HTMLDivElement>(null)
  const minutesRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasUserInteracted = useRef(false)

  // Parse value prop and sync to committed state (only when value prop changes from parent)
  useEffect(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":")
      if (h && m) {
        const normalizedH = h.padStart(2, "0")
        const normalizedM = m.padStart(2, "0")
        // Only update if different and user hasn't interacted
        if (!hasUserInteracted.current && (normalizedH !== committedHours || normalizedM !== committedMinutes)) {
          setCommittedHours(normalizedH)
          setCommittedMinutes(normalizedM)
          setPreviewHours(normalizedH)
          setPreviewMinutes(normalizedM)
        }
      }
    } else if (!value && !hasUserInteracted.current) {
      // Set default time only if no value provided and no user interaction
      const now = new Date()
      const currentHours = now.getHours().toString().padStart(2, "0")
      const currentMinutes = now.getMinutes().toString().padStart(2, "0")
      setCommittedHours(currentHours)
      setCommittedMinutes(currentMinutes)
      setPreviewHours(currentHours)
      setPreviewMinutes(currentMinutes)
    }
  }, [value, committedHours, committedMinutes])

  const hoursList = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  const scrollToSelected = useCallback((container: HTMLDivElement | null, selectedValue: string) => {
    if (!container) return
    const element = container.querySelector(`[data-value="${selectedValue}"]`) as HTMLElement
    if (element) {
      const containerHeight = container.clientHeight
      const elementTop = element.offsetTop - container.offsetTop
      const elementHeight = element.clientHeight
      const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2)
      container.scrollTo({ top: scrollPosition, behavior: "smooth" })
    }
  }, [])

  // Handle scroll - only update PREVIEW state, never commit
  const handleScroll = useCallback((container: HTMLDivElement, type: "hours" | "minutes") => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const containerHeight = container.clientHeight
      const scrollTop = container.scrollTop
      const itemHeight = 40
      const centerPosition = scrollTop + containerHeight / 2
      const selectedIndex = Math.round(centerPosition / itemHeight)
      
      if (type === "hours") {
        const selectedHour = hoursList[Math.max(0, Math.min(selectedIndex, 23))]
        if (selectedHour && selectedHour !== previewHours) {
          setPreviewHours(selectedHour) // Only update preview, not committed
        }
      } else {
        const selectedMinute = minutesList[Math.max(0, Math.min(selectedIndex, 59))]
        if (selectedMinute && selectedMinute !== previewMinutes) {
          setPreviewMinutes(selectedMinute) // Only update preview, not committed
        }
      }
    }, 100)
  }, [previewHours, previewMinutes, hoursList, minutesList])

  // Commit the preview values to parent
  const commitValue = useCallback((h: string, m: string) => {
    const timeString = `${h}:${m}`
    if (timeString !== value) {
      hasUserInteracted.current = true
      setCommittedHours(h)
      setCommittedMinutes(m)
      onChange(timeString)
      // Reset flag after delay
      setTimeout(() => {
        hasUserInteracted.current = false
      }, 200)
    }
  }, [value, onChange])

  // Close on outside click - DON'T save on outside click, just close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Reset preview to committed values and close
        setPreviewHours(committedHours)
        setPreviewMinutes(committedMinutes)
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      // Reset preview to committed when opening
      setPreviewHours(committedHours)
      setPreviewMinutes(committedMinutes)
      // Scroll to selected values when opening
      setTimeout(() => {
        scrollToSelected(hoursRef.current, committedHours)
        scrollToSelected(minutesRef.current, committedMinutes)
      }, 100)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [isOpen, committedHours, committedMinutes, scrollToSelected])

  const handleHourClick = useCallback((hour: string) => {
    setPreviewHours(hour)
    setCommittedHours(hour)
    scrollToSelected(hoursRef.current, hour)
    commitValue(hour, previewMinutes) // Commit immediately on click
  }, [previewMinutes, scrollToSelected, commitValue])

  const handleMinuteClick = useCallback((minute: string) => {
    setPreviewMinutes(minute)
    setCommittedMinutes(minute)
    scrollToSelected(minutesRef.current, minute)
    commitValue(previewHours, minute) // Commit immediately on click
  }, [previewHours, scrollToSelected, commitValue])

  const handleClose = useCallback(() => {
    // Commit preview values when clicking "Klaar"
    commitValue(previewHours, previewMinutes)
    setIsOpen(false)
  }, [previewHours, previewMinutes, commitValue])

  // Display the committed value, not the preview
  const displayValue = value || `${committedHours}:${committedMinutes}`

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor={`time-${label}`}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <button
          type="button"
          id={`time-${label}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className={value ? "text-foreground font-medium" : "text-muted-foreground"}>
            {displayValue}
          </span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </button>

        {isOpen && (
          <div 
            className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="flex relative max-h-[200px] overflow-hidden">
              {/* Selection indicator overlay */}
              <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 border-y-2 border-autoofy-dark/30 pointer-events-none z-10"></div>
              
              {/* Hours */}
              <div
                ref={hoursRef}
                className="flex-1 overflow-y-auto scroll-smooth"
                style={{
                  scrollSnapType: "y mandatory",
                }}
                onScroll={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleScroll(e.currentTarget, "hours")
                }}
              >
                {/* Spacer for centering */}
                <div className="h-[80px]"></div>
                {hoursList.map((hour) => (
                  <div
                    key={hour}
                    data-value={hour}
                    className={`h-10 flex items-center justify-center scroll-snap-align-center transition-colors cursor-pointer ${
                      previewHours === hour 
                        ? "bg-autoofy-dark text-white font-bold text-lg" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleHourClick(hour)
                    }}
                  >
                    {hour}
                  </div>
                ))}
                {/* Spacer for centering */}
                <div className="h-[80px]"></div>
              </div>

              <div className="w-px bg-border"></div>

              {/* Minutes */}
              <div
                ref={minutesRef}
                className="flex-1 overflow-y-auto scroll-smooth"
                style={{
                  scrollSnapType: "y mandatory",
                }}
                onScroll={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleScroll(e.currentTarget, "minutes")
                }}
              >
                {/* Spacer for centering */}
                <div className="h-[80px]"></div>
                {minutesList.map((minute) => (
                  <div
                    key={minute}
                    data-value={minute}
                    className={`h-10 flex items-center justify-center scroll-snap-align-center transition-colors cursor-pointer ${
                      previewMinutes === minute 
                        ? "bg-autoofy-dark text-white font-bold text-lg" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleMinuteClick(minute)
                    }}
                  >
                    {minute}
                  </div>
                ))}
                {/* Spacer for centering */}
                <div className="h-[80px]"></div>
              </div>
            </div>
            <div className="p-2 border-t bg-muted/30">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleClose()
                }}
                className="w-full px-4 py-2 text-sm font-medium bg-autoofy-dark text-white rounded-md hover:bg-autoofy-dark/90"
              >
                Klaar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
