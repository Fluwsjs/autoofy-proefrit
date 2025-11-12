"use client"

import { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface TimePickerProps {
  label: string
  value: string // Format: "HH:MM"
  onChange: (value: string) => void
  required?: boolean
}

export function TimePicker({ label, value, onChange, required }: TimePickerProps) {
  const [hours, setHours] = useState("09")
  const [minutes, setMinutes] = useState("00")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hoursRef = useRef<HTMLDivElement>(null)
  const minutesRef = useRef<HTMLDivElement>(null)

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      if (h && m) {
        setHours(h.padStart(2, "0"))
        setMinutes(m.padStart(2, "0"))
      }
    } else {
      // Default to current time if no value
      const now = new Date()
      setHours(now.getHours().toString().padStart(2, "0"))
      setMinutes(now.getMinutes().toString().padStart(2, "0"))
    }
  }, [value])

  // Update parent when hours/minutes change (but only if different from current value)
  useEffect(() => {
    const timeString = `${hours}:${minutes}`
    if (timeString !== value && timeString !== "") {
      onChange(timeString)
    }
  }, [hours, minutes])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      // Scroll to selected values when opening
      setTimeout(() => {
        scrollToSelected(hoursRef.current, hours)
        scrollToSelected(minutesRef.current, minutes)
      }, 50)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, hours, minutes])

  const hoursList = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  const scrollToSelected = (container: HTMLDivElement | null, selectedValue: string) => {
    if (!container) return
    const element = container.querySelector(`[data-value="${selectedValue}"]`) as HTMLElement
    if (element) {
      const containerHeight = container.clientHeight
      const elementTop = element.offsetTop - container.offsetTop
      const elementHeight = element.clientHeight
      const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2)
      container.scrollTo({ top: scrollPosition, behavior: "smooth" })
    }
  }

  const handleScroll = (container: HTMLDivElement, type: "hours" | "minutes") => {
    // Debounce scroll events to prevent too many updates
    const containerHeight = container.clientHeight
    const scrollTop = container.scrollTop
    const itemHeight = 40 // Approximate height of each item
    const centerPosition = scrollTop + containerHeight / 2
    const selectedIndex = Math.round(centerPosition / itemHeight)
    
    if (type === "hours") {
      const selectedHour = hoursList[Math.max(0, Math.min(selectedIndex, 23))]
      if (selectedHour && selectedHour !== hours) {
        setHours(selectedHour)
      }
    } else {
      const selectedMinute = minutesList[Math.max(0, Math.min(selectedIndex, 59))]
      if (selectedMinute && selectedMinute !== minutes) {
        setMinutes(selectedMinute)
      }
    }
  }

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor={`time-${label}`}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <button
          type="button"
          id={`time-${label}`}
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className={value ? "text-foreground font-medium" : "text-muted-foreground"}>
            {value || `${hours}:${minutes}`}
          </span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-xl">
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
                  // Throttle scroll events
                  const target = e.currentTarget
                  clearTimeout((target as any).scrollTimeout)
                  ;(target as any).scrollTimeout = setTimeout(() => {
                    handleScroll(target, "hours")
                  }, 50)
                }}
              >
                {/* Spacer for centering */}
                <div className="h-[80px]"></div>
                {hoursList.map((hour) => (
                  <div
                    key={hour}
                    data-value={hour}
                    className={`h-10 flex items-center justify-center scroll-snap-align-center transition-colors ${
                      hours === hour 
                        ? "bg-autoofy-dark text-white font-bold text-lg" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => {
                      setHours(hour)
                      scrollToSelected(hoursRef.current, hour)
                      // Update immediately on click
                      const timeString = `${hour}:${minutes}`
                      onChange(timeString)
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
                  // Throttle scroll events
                  const target = e.currentTarget
                  clearTimeout((target as any).scrollTimeout)
                  ;(target as any).scrollTimeout = setTimeout(() => {
                    handleScroll(target, "minutes")
                  }, 50)
                }}
              >
                {/* Spacer for centering */}
                <div className="h-[80px]"></div>
                {minutesList.map((minute) => (
                  <div
                    key={minute}
                    data-value={minute}
                    className={`h-10 flex items-center justify-center scroll-snap-align-center transition-colors ${
                      minutes === minute 
                        ? "bg-autoofy-dark text-white font-bold text-lg" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => {
                      setMinutes(minute)
                      scrollToSelected(minutesRef.current, minute)
                      // Update immediately on click
                      const timeString = `${hours}:${minute}`
                      onChange(timeString)
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
                onClick={() => {
                  // Ensure final value is saved when closing
                  const timeString = `${hours}:${minutes}`
                  onChange(timeString)
                  setIsOpen(false)
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

