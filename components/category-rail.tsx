"use client"

import { useRef, useState, useEffect } from "react"
import { CategoryCard } from "@/components/category-card"

interface CategoryRailProps {
  categories: {
    name: string
    count: number
    icon: React.ReactNode
    shortName: string
    color: string
  }[]
}

export function CategoryRail({ categories }: CategoryRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Rail Dragging State
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [showScrollbar, setShowScrollbar] = useState(false)
  
  // Scrollbar State
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isDraggingScrollbar, setIsDraggingScrollbar] = useState(false)
  const scrollbarTrackRef = useRef<HTMLDivElement>(null)
  const scrollbarStartX = useRef(0)
  const scrollbarStartScrollLeft = useRef(0)

  // 1. Check Scrollability Logic
  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current
      // Show ONLY if content is wider than container
      setShowScrollbar(scrollWidth > clientWidth)
    }
  }

  // Effect to check on mount and resize
  useEffect(() => {
    checkScrollability()
    window.addEventListener("resize", checkScrollability)
    return () => window.removeEventListener("resize", checkScrollability)
  }, [categories])

  // 2. Mouse Wheel Handler (Horizontal Scroll)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return
      e.preventDefault()
      el.scrollLeft += e.deltaY 
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  // 2. Global Mouse Events for Scrollbar Dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingScrollbar || !scrollRef.current || !scrollbarTrackRef.current) return
      
      e.preventDefault()
      const deltaX = e.clientX - scrollbarStartX.current
      
      const { scrollWidth, clientWidth } = scrollRef.current
      const trackWidth = scrollbarTrackRef.current.clientWidth
      // We assume thumb is 30% width, so effective travel area is 70% of track
      // Or more precisely: Thumb width in pixels vs Track width in pixels
      const thumbWidthPct = 0.3
      const thumbWidth = trackWidth * thumbWidthPct
      const trackScrollableWidth = trackWidth - thumbWidth
      const contentScrollableWidth = scrollWidth - clientWidth
      
      if (trackScrollableWidth <= 0) return
      
      const ratio = contentScrollableWidth / trackScrollableWidth
      scrollRef.current.scrollLeft = scrollbarStartScrollLeft.current + (deltaX * ratio)
    }

    const handleGlobalMouseUp = () => {
      setIsDraggingScrollbar(false)
    }

    if (isDraggingScrollbar) {
      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDraggingScrollbar])

  // 3. Scroll Progress Handler
  const onScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      const totalScroll = scrollWidth - clientWidth
      const progress = (scrollLeft / totalScroll) * 100
      setScrollProgress(Number.isNaN(progress) ? 0 : progress)
    }
  }

  // 4. Rail Drag Handlers
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    if (scrollRef.current) {
      setStartX(e.pageX - scrollRef.current.offsetLeft)
      setScrollLeft(scrollRef.current.scrollLeft)
    }
  }

  const onMouseLeave = () => setIsDragging(false)
  const onMouseUp = () => setIsDragging(false)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  // 5. Scrollbar Interaction (Click to jump / Drag thumb)
  const handleScrollbarInteract = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only jump if we clicked the track, not the thumb (thumb has its own handler but events might bubble if not stopped)
    // Actually, we want to allow jumping if clicking empty track space.
    if (!scrollRef.current) return;
    
    // If we are dragging thumb, this might still fire on mouse up? 
    // Usually click fires after mouseup. We can check target?
    // But simpliest is: if we just started dragging, don't jump.
    if (isDraggingScrollbar) return;

    // 1. Calculate Click Position
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left; // X position within the bar
    const ratio = clickX / rect.width; // Percentage (0.0 to 1.0)
    
    // 2. Calculate Target Scroll
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const targetScroll = maxScroll * ratio;
    
    // 3. Scroll There
    scrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the track click
    setIsDraggingScrollbar(true)
    
    scrollbarStartX.current = e.clientX
    if (scrollRef.current) {
      scrollbarStartScrollLeft.current = scrollRef.current.scrollLeft
    }
  }

  return (
    <div className="relative w-[90%] mx-auto justify-center items-center flex flex-col">
      {/* Outer Wrapper with Mask */}
      <div className="relative w-fit max-w-full justify-center mx-auto mask-[linear-gradient(to_right,transparent,black_2%,black_98%,transparent)]">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className={`
            flex gap-4 overflow-x-auto w-full
            px-4 
            pb-4 sm:pb-4 md:pb-6
            pt-6 sm:pt-6 md:pt-8
            scrollbar-hide /* Hide native scrollbar everywhere */
            select-none /* Stops text highlighting */
            ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          `}
        >
          {categories.map((cat) => (
            <CategoryCard key={cat.name} {...cat} />
          ))}
        </div>
      </div>

      {/* Draggable Scrollbar */}
      {/* Draggable Scrollbar (Conditional) */}
      {showScrollbar && (
        <div className="w-full flex justify-center mt-4 mb-2 transition-opacity duration-300 animate-in fade-in">
          <div 
            ref={scrollbarTrackRef}
            className="w-48 md:w-64 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative cursor-pointer"
            // We keep the click-to-jump logic on the track
            onClick={handleScrollbarInteract}
          >
            <div 
              className={`h-full bg-[#00dee8] rounded-full absolute top-0 left-0 hover:bg-[#00dee8] ${isDraggingScrollbar ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={handleThumbMouseDown}
              style={{ 
                width: '40%', 
                left: `${Math.min(Math.max(scrollProgress * 0.6, 0), 60)}%`,
                // Disable transition during drag for instant feedback
                transition: isDraggingScrollbar ? 'none' : 'left 0.1s ease-out' 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
