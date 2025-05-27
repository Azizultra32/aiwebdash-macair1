import { useEffect, useState } from 'react'

const FontSizeSelector = () => {
  const [size, setSize] = useState(() => {
    const stored = localStorage.getItem('font-size')
    return stored ? parseInt(stored, 10) : 16
  })

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-base', `${size}px`)
    localStorage.setItem('font-size', String(size))
  }, [size])

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="font-size" className="text-sm whitespace-nowrap">
        Font Size
      </label>
      <input
        id="font-size"
        type="range"
        min="12"
        max="24"
        value={size}
        onChange={(e) => setSize(parseInt(e.target.value))}
        className="cursor-pointer"
      />
      <span className="text-sm">{size}px</span>
    </div>
  )
}

export default FontSizeSelector