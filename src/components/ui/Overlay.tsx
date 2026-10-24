import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { lockScroll } from '../../lib/motion'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  variant?: 'drawer' | 'modal'
  label: string
}

/** Accessible drawer / modal with backdrop, Escape-to-close and scroll lock. */
export function Overlay({ open, onClose, children, variant = 'modal', label }: Props) {
  useEffect(() => {
    if (!open) return
    lockScroll(true)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      lockScroll(false)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          {variant === 'drawer' ? (
            <motion.div
              className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l hairline bg-bg"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
              data-lenis-prevent
            >
              {children}
            </motion.div>
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center md:items-center md:p-6">
              <motion.div
                className="pointer-events-auto relative max-h-[94svh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] border hairline bg-bg md:rounded-[2rem]"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                data-lenis-prevent
              >
                {children}
              </motion.div>
            </div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}
