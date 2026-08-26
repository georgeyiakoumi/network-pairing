'use client'

import { useMotionValue, useTransform, motion, type PanInfo } from 'framer-motion'
import { X, Handshake } from 'lucide-react'

const SWIPE_THRESHOLD = 100
const VELOCITY_THRESHOLD = 500

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  disabled,
}: {
  children: React.ReactNode
  onSwipeLeft: () => void
  onSwipeRight: () => void
  disabled?: boolean
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12])
  const passOpacity = useTransform(x, [-150, -50, 0], [1, 0, 0])
  const connectOpacity = useTransform(x, [0, 50, 150], [0, 0, 1])

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (disabled) return

    const { offset, velocity } = info
    const swipedLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD
    const swipedRight = offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD

    if (swipedLeft) {
      onSwipeLeft()
    } else if (swipedRight) {
      onSwipeRight()
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full overflow-visible">
      {/* Swipe indicators — above the card, centered */}
      <div className="relative h-10 flex items-center justify-center">
        <motion.div
          className="absolute flex items-center gap-2 rounded-full bg-destructive/10 px-5 py-2 text-destructive font-semibold text-base border-2 border-destructive/30"
          style={{ opacity: passOpacity }}
        >
          <X className="size-5" />
          Pass
        </motion.div>
        <motion.div
          className="absolute flex items-center gap-2 rounded-full bg-emerald-500/10 px-5 py-2 text-emerald-600 dark:text-emerald-400 font-semibold text-base border-2 border-emerald-500/30"
          style={{ opacity: connectOpacity }}
        >
          <Handshake className="size-5" />
          Connect
        </motion.div>
      </div>

      {/* Draggable card */}
      <motion.div
        drag={disabled ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        style={{ x, rotate }}
        whileDrag={{ cursor: 'grabbing' }}
        className="touch-none"
      >
        {children}
      </motion.div>
    </div>
  )
}
