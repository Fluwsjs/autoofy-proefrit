"use client"

import { useState, useRef, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SwipeableCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: {
    icon: ReactNode
    label: string
    color: string
    onClick: () => void
  }
  rightAction?: {
    icon: ReactNode
    label: string
    color: string
    onClick: () => void
  }
  threshold?: number
}

export function SwipeableCard({
  children,
  leftAction,
  rightAction,
  threshold = 80,
}: SwipeableCardProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    currentX.current = e.touches[0].clientX
    const diff = currentX.current - startX.current
    
    // Limit swipe distance
    const maxSwipe = 120
    const clampedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff))
    
    // Only allow swipe in directions that have actions
    if (diff < 0 && !leftAction) return
    if (diff > 0 && !rightAction) return
    
    setTranslateX(clampedDiff)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    
    if (translateX < -threshold && leftAction) {
      // Trigger left action (swipe left reveals right side action)
      leftAction.onClick()
    } else if (translateX > threshold && rightAction) {
      // Trigger right action (swipe right reveals left side action)
      rightAction.onClick()
    }
    
    // Reset position
    setTranslateX(0)
  }

  const getActionOpacity = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      return Math.min(1, Math.abs(translateX) / threshold)
    }
    return Math.min(1, translateX / threshold)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Left action (revealed when swiping right) */}
      {rightAction && (
        <div 
          className={cn(
            "absolute inset-y-0 left-0 flex items-center justify-start pl-4 w-24",
            rightAction.color
          )}
          style={{ opacity: getActionOpacity('right') }}
        >
          <div className="flex flex-col items-center gap-1 text-white">
            {rightAction.icon}
            <span className="text-xs font-medium">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Right action (revealed when swiping left) */}
      {leftAction && (
        <div 
          className={cn(
            "absolute inset-y-0 right-0 flex items-center justify-end pr-4 w-24",
            leftAction.color
          )}
          style={{ opacity: getActionOpacity('left') }}
        >
          <div className="flex flex-col items-center gap-1 text-white">
            {leftAction.icon}
            <span className="text-xs font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className={cn(
          "relative bg-white transition-transform",
          !isDragging && "duration-300 ease-out"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

