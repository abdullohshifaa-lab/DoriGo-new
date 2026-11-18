import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, filter: 'blur(4px)' },
}

export default function PageTransition({ children }) {
  return (
    <motion.main
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-5xl px-4 pb-32 pt-6 md:px-6 md:pb-16"
    >
      {children}
    </motion.main>
  )
}
