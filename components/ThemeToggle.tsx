'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full bg-gradient-to-r from-cyber-purple to-cyber-pink p-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(131,56,236,0.5)] group"
      aria-label="Toggle theme"
    >
      {/* Track */}
      <div className="absolute inset-1 rounded-full bg-card/50 backdrop-blur-sm"></div>
      
      {/* Slider */}
      <div
        className={`relative z-10 w-6 h-6 rounded-full bg-gradient-to-br from-white to-gray-100 shadow-lg transition-all duration-300 flex items-center justify-center ${
          theme === 'light' ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {theme === 'dark' ? (
          <Moon className="w-4 h-4 text-cyber-purple" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </div>
      
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Moon className={`w-4 h-4 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100 text-white' : 'opacity-30 text-white'}`} />
        <Sun className={`w-4 h-4 transition-opacity duration-300 ${theme === 'light' ? 'opacity-100 text-white' : 'opacity-30 text-white'}`} />
      </div>
    </button>
  )
}

export function ThemeToggleCompact() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-card hover:bg-muted border border-border transition-all hover:shadow-lg group"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className="w-5 h-5 text-cyber-purple group-hover:rotate-12 transition-transform" />
      ) : (
        <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
      )}
    </button>
  )
}

