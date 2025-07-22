import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeColor = 
  | 'blue'     // Default AOL blue
  | 'green'    // Success/money green  
  | 'orange'   // Warning/energy orange
  | 'purple'   // Premium purple
  | 'red'      // Alert/urgent red
  | 'teal'     // Professional teal
  | 'indigo'   // Deep corporate indigo
  | 'pink'     // Creative pink

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'dark' | 'light'
  themeColor: ThemeColor
  setThemeColor: (color: ThemeColor) => void
  resetToDefault: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const themeColorVariables = {
  blue: {
    primary: '217 91% 60%',
    primaryForeground: '210 40% 98%',
    accent: '217 91% 95%',
    accentForeground: '217 91% 10%'
  },
  green: {
    primary: '142 76% 36%',
    primaryForeground: '210 40% 98%',
    accent: '142 76% 95%',
    accentForeground: '142 86% 10%'
  },
  orange: {
    primary: '25 95% 53%',
    primaryForeground: '210 40% 98%',
    accent: '25 95% 95%',
    accentForeground: '25 95% 10%'
  },
  purple: {
    primary: '262 83% 58%',
    primaryForeground: '210 40% 98%',
    accent: '262 83% 95%',
    accentForeground: '262 83% 10%'
  },
  red: {
    primary: '0 84% 60%',
    primaryForeground: '210 40% 98%',
    accent: '0 84% 95%',
    accentForeground: '0 84% 10%'
  },
  teal: {
    primary: '173 58% 39%',
    primaryForeground: '210 40% 98%',
    accent: '173 58% 95%',
    accentForeground: '173 58% 10%'
  },
  indigo: {
    primary: '231 48% 48%',
    primaryForeground: '210 40% 98%',
    accent: '231 48% 95%',
    accentForeground: '231 48% 10%'
  },
  pink: {
    primary: '322 65% 54%',
    primaryForeground: '210 40% 98%',
    accent: '322 65% 95%',
    accentForeground: '322 65% 10%'
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('aol-theme')
    return (stored as Theme) || 'dark' // Default to dark mode
  })

  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    const stored = localStorage.getItem('aol-theme-color')
    return (stored as ThemeColor) || 'blue' // Default to AOL blue
  })

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const root = window.document.documentElement

    // Remove previous theme classes
    root.classList.remove('light', 'dark')

    let effectiveTheme: 'dark' | 'light'

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      effectiveTheme = theme
    }

    setResolvedTheme(effectiveTheme)
    root.classList.add(effectiveTheme)
    localStorage.setItem('aol-theme', theme)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    const colors = themeColorVariables[themeColor]

    // Apply CSS custom properties for the selected color
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--primary-foreground', colors.primaryForeground)
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--accent-foreground', colors.accentForeground)

    localStorage.setItem('aol-theme-color', themeColor)
  }, [themeColor])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        const newTheme = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(newTheme)
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const resetToDefault = () => {
    setTheme('dark')
    setThemeColor('blue')
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      resolvedTheme, 
      themeColor, 
      setThemeColor,
      resetToDefault 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
