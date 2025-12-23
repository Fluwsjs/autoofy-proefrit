"use client"

import { useState, useRef, ReactNode, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  threshold = 80 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const isAtTop = useRef(true)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return
    
    // Check if we're at the top of the scroll container
    const container = containerRef.current
    if (container && container.scrollTop <= 0) {
      isAtTop.current = true
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    } else {
      isAtTop.current = false
    }
  }, [isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing || !isAtTop.current) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    // Only allow pulling down
    if (diff > 0) {
      // Add resistance to the pull
      const resistance = 0.5
      const distance = Math.min(diff * resistance, threshold * 1.5)
      setPullDistance(distance)
    }
  }, [isPulling, isRefreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || isRefreshing) return

    setIsPulling(false)

    if (pullDistance >= threshold) {
      setIsRefreshing(true)
      setPullDistance(threshold)
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [isPulling, isRefreshing, pullDistance, threshold, onRefresh])

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 360

  return (
    <div 
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className={cn(
          "absolute left-0 right-0 flex justify-center items-center transition-all duration-200 z-10 pointer-events-none",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ 
          top: pullDistance - 40,
          height: 40 
        }}
      >
        <div className={cn(
          "w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center",
          isRefreshing && "animate-pulse"
        )}>
          <RefreshCw 
            className={cn(
              "h-5 w-5 text-autoofy-red transition-transform",
              isRefreshing && "animate-spin"
            )}
            style={{ 
              transform: !isRefreshing ? `rotate(${rotation}deg)` : undefined 
            }}
          />
        </div>
      </div>

      {/* Content with pull offset */}
      <div 
        className={cn(
          "transition-transform",
          !isPulling && !isRefreshing && "duration-300"
        )}
        style={{ 
          transform: `translateY(${pullDistance}px)` 
        }}
      >
        {children}
      </div>
    </div>
  )
}

