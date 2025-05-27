import { motion } from 'framer-motion'
import React from 'react'

type Props = {
  children: React.ReactNode
  className?: string
}

const DraggableContainer: React.FC<Props> = ({ children, className }) => (
  <motion.div drag dragMomentum={false} className={className} style={{ cursor: 'move' }}>
    {children}
  </motion.div>
)

export default DraggableContainer