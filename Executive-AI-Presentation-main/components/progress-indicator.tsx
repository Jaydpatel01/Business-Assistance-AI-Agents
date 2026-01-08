"use client"

import { motion } from "framer-motion"

interface ProgressIndicatorProps {
  totalSlides: number
  currentSlide: number
  onSelectSlide: (index: number) => void
}

export function ProgressIndicator({ totalSlides, currentSlide, onSelectSlide }: ProgressIndicatorProps) {
  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col items-center space-y-2">
      {Array.from({ length: totalSlides }).map((_, index) => (
        <motion.div
          key={index}
          className="relative"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div
            className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
              currentSlide === index
                ? "bg-primary scale-125"
                : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
            }`}
            onClick={() => onSelectSlide(index)}
          />
          {currentSlide === index && (
            <motion.div
              className="absolute -inset-1 rounded-full border-2 border-primary"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
