'use client'

import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface AnnouncementButtonProps {
  message: string
}

export function AnnouncementButton({ message }: AnnouncementButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="View announcement"
      >
        <Bell className="w-6 h-6" />
      </motion.button>

      {/* Modal Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-hero border border-stroke rounded-lg p-6 max-w-md w-[90vw] shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Announcement
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/90 text-base leading-relaxed">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
