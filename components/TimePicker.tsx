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
  const [isOpen, setIsOpen] = useState(false)
  const [selectedHours, setSelectedHours] = useState("09")
  const [selectedMinutes, setSelectedMinutes] = useState("00")
  
  const containerRef = useRef<HTMLDivElement>(null)
  const hoursRef = useRef<HTMLDivElement>(null)
  const minutesRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutHoursRef = useRef<NodeJS.Timeout | null>(null)
  const scrollTimeoutMinutesRef = useRef<NodeJS.Timeout | null>(null)

  const ITEM_HEIGHT = 44
  const VISIBLE_ITEMS = 7
  const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS

  const hoursList = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
  const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

  // Parse initial value - alleen bij mount of wanneer value van buitenaf verandert en picker NIET open is
  useEffect(() => {
    if (!isOpen && value && value.includes(":")) {
      const [h, m] = value.split(":")
      if (h && m) {
        setSelectedHours(h.padStart(2, "0"))
        setSelectedMinutes(m.padStart(2, "0"))
      }
    }
  }, [value, isOpen])

  // Scroll to a specific index
  const scrollToIndex = useCallback((container: HTMLDivElement | null, index: number, smooth = true) => {
    if (!container) return
    const scrollPosition = index * ITEM_HEIGHT
    container.scrollTo({ 
      top: scrollPosition, 
      behavior: smooth ? "smooth" : "auto" 
    })
  }, [])

  // Get index from scroll position
  const getIndexFromScroll = (scrollTop: number) => {
    return Math.round(scrollTop / ITEM_HEIGHT)
  }

  // Handle scroll for hours
  const handleHoursScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    isScrollingRef.current = true
    
    if (scrollTimeoutHoursRef.current) {
      clearTimeout(scrollTimeoutHoursRef.current)
    }

    const index = getIndexFromScroll(container.scrollTop)
    const clampedIndex = Math.max(0, Math.min(index, 23))
    const newHour = hoursList[clampedIndex]
    
    if (newHour && newHour !== selectedHours) {
      setSelectedHours(newHour)
    }

    scrollTimeoutHoursRef.current = setTimeout(() => {
      // Snap to nearest item
      const finalIndex = getIndexFromScroll(container.scrollTop)
      const clampedFinalIndex = Math.max(0, Math.min(finalIndex, 23))
      container.scrollTo({ 
        top: clampedFinalIndex * ITEM_HEIGHT, 
        behavior: "smooth" 
      })
      setSelectedHours(hoursList[clampedFinalIndex])
      isScrollingRef.current = false
    }, 150)
  }, [hoursList, selectedHours])

  // Handle scroll for minutes
  const handleMinutesScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    isScrollingRef.current = true
    
    if (scrollTimeoutMinutesRef.current) {
      clearTimeout(scrollTimeoutMinutesRef.current)
    }

    const index = getIndexFromScroll(container.scrollTop)
    const clampedIndex = Math.max(0, Math.min(index, 59))
    const newMinute = minutesList[clampedIndex]
    
    if (newMinute && newMinute !== selectedMinutes) {
      setSelectedMinutes(newMinute)
    }

    scrollTimeoutMinutesRef.current = setTimeout(() => {
      // Snap to nearest item
      const finalIndex = getIndexFromScroll(container.scrollTop)
      const clampedFinalIndex = Math.max(0, Math.min(finalIndex, 59))
      container.scrollTo({ 
        top: clampedFinalIndex * ITEM_HEIGHT, 
        behavior: "smooth" 
      })
      setSelectedMinutes(minutesList[clampedFinalIndex])
      isScrollingRef.current = false
    }, 150)
  }, [minutesList, selectedMinutes])

  // Open picker
  const handleOpen = useCallback(() => {
    // Set initial values from current value prop
    if (value && value.includes(":")) {
      const [h, m] = value.split(":")
      setSelectedHours(h.padStart(2, "0"))
      setSelectedMinutes(m.padStart(2, "0"))
    }
    setIsOpen(true)
  }, [value])

  // Scroll to position when picker opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      
      // Wait for DOM to be ready
      requestAnimationFrame(() => {
        const hourIndex = hoursList.indexOf(selectedHours)
        const minuteIndex = minutesList.indexOf(selectedMinutes)
        
        if (hoursRef.current) {
          hoursRef.current.scrollTop = hourIndex * ITEM_HEIGHT
        }
        if (minutesRef.current) {
          minutesRef.current.scrollTop = minuteIndex * ITEM_HEIGHT
        }
      })
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, selectedHours, selectedMinutes, hoursList, minutesList])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (scrollTimeoutHoursRef.current) clearTimeout(scrollTimeoutHoursRef.current)
      if (scrollTimeoutMinutesRef.current) clearTimeout(scrollTimeoutMinutesRef.current)
    }
  }, [])

  const handleConfirm = useCallback(() => {
    onChange(`${selectedHours}:${selectedMinutes}`)
    setIsOpen(false)
  }, [selectedHours, selectedMinutes, onChange])

  const handleCancel = useCallback(() => {
    // Reset to original value
    if (value && value.includes(":")) {
      const [h, m] = value.split(":")
      setSelectedHours(h.padStart(2, "0"))
      setSelectedMinutes(m.padStart(2, "0"))
    }
    setIsOpen(false)
  }, [value])

  // Click on item to select
  const handleHourClick = useCallback((hour: string, index: number) => {
    setSelectedHours(hour)
    scrollToIndex(hoursRef.current, index)
  }, [scrollToIndex])

  const handleMinuteClick = useCallback((minute: string, index: number) => {
    setSelectedMinutes(minute)
    scrollToIndex(minutesRef.current, index)
  }, [scrollToIndex])

  // Get opacity based on distance from center
  const getItemStyle = (index: number, selectedIndex: number) => {
    const distance = Math.abs(index - selectedIndex)
    
    if (distance === 0) {
      return { opacity: 1, fontWeight: 600, fontSize: "22px" }
    } else if (distance === 1) {
      return { opacity: 0.6, fontWeight: 400, fontSize: "20px" }
    } else if (distance === 2) {
      return { opacity: 0.35, fontWeight: 400, fontSize: "18px" }
    } else {
      return { opacity: 0.15, fontWeight: 400, fontSize: "16px" }
    }
  }

  const displayValue = value || `${selectedHours}:${selectedMinutes}`
  const selectedHourIndex = hoursList.indexOf(selectedHours)
  const selectedMinuteIndex = minutesList.indexOf(selectedMinutes)

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor={`time-${label}`}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <button
          type="button"
          id={`time-${label}`}
          onClick={handleOpen}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className={value ? "text-foreground font-medium" : "text-muted-foreground"}>
            {displayValue}
          </span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* iOS-style Modal Picker */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCancel}
            />
            
            {/* Picker Container */}
            <div 
              className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 animate-in slide-in-from-bottom-4 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#2c2c2e] rounded-t-2xl px-4 py-3 flex items-center justify-between border-b border-white/10">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-[#ff9f0a] text-base font-medium hover:opacity-80 transition-opacity"
                >
                  Annuleer
                </button>
                <span className="text-white/90 text-base font-semibold">{label}</span>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="text-[#ff9f0a] text-base font-semibold hover:opacity-80 transition-opacity"
                >
                  Klaar
                </button>
              </div>

              {/* Picker Wheels */}
              <div className="bg-[#1c1c1e] rounded-b-2xl overflow-hidden">
                <div 
                  className="flex relative"
                  style={{ height: CONTAINER_HEIGHT }}
                >
                  {/* Selection Highlight Bar */}
                  <div 
                    className="absolute left-4 right-4 bg-[#3a3a3c] rounded-xl pointer-events-none z-0"
                    style={{ 
                      top: "50%", 
                      transform: "translateY(-50%)",
                      height: ITEM_HEIGHT 
                    }}
                  />
                  
                  {/* Hours Wheel */}
                  <div
                    ref={hoursRef}
                    className="flex-1 overflow-y-scroll scrollbar-hide relative z-10"
                    style={{
                      scrollSnapType: "y mandatory",
                    }}
                    onScroll={handleHoursScroll}
                  >
                    {/* Top padding for centering */}
                    <div style={{ height: ITEM_HEIGHT * 3 }} />
                    
                    {hoursList.map((hour, index) => {
                      const style = getItemStyle(index, selectedHourIndex)
                      return (
                        <div
                          key={hour}
                          className="flex items-center justify-center text-white transition-opacity duration-100 cursor-pointer select-none"
                          style={{
                            height: ITEM_HEIGHT,
                            scrollSnapAlign: "center",
                            ...style,
                          }}
                          onClick={() => handleHourClick(hour, index)}
                        >
                          {hour}
                        </div>
                      )
                    })}
                    
                    {/* Bottom padding for centering */}
                    <div style={{ height: ITEM_HEIGHT * 3 }} />
                  </div>

                  {/* Separator : */}
                  <div 
                    className="flex items-center justify-center text-white text-2xl font-semibold z-10"
                    style={{ width: 24 }}
                  >
                    :
                  </div>

                  {/* Minutes Wheel */}
                  <div
                    ref={minutesRef}
                    className="flex-1 overflow-y-scroll scrollbar-hide relative z-10"
                    style={{
                      scrollSnapType: "y mandatory",
                    }}
                    onScroll={handleMinutesScroll}
                  >
                    {/* Top padding for centering */}
                    <div style={{ height: ITEM_HEIGHT * 3 }} />
                    
                    {minutesList.map((minute, index) => {
                      const style = getItemStyle(index, selectedMinuteIndex)
                      return (
                        <div
                          key={minute}
                          className="flex items-center justify-center text-white transition-opacity duration-100 cursor-pointer select-none"
                          style={{
                            height: ITEM_HEIGHT,
                            scrollSnapAlign: "center",
                            ...style,
                          }}
                          onClick={() => handleMinuteClick(minute, index)}
                        >
                          {minute}
                        </div>
                      )
                    })}
                    
                    {/* Bottom padding for centering */}
                    <div style={{ height: ITEM_HEIGHT * 3 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
