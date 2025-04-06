import type { Theme } from '@/types'
import { useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'note-ia-theme'

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            // Try to get theme from localStorage
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
            if (savedTheme) {
                return savedTheme
            }

            // Fallback to system preference
            return document.documentElement.classList.contains('dark')
                ? 'dark'
                : 'light'
        }
        return 'light'
    })

    useEffect(() => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)

        // Save theme to localStorage
        localStorage.setItem(THEME_STORAGE_KEY, theme)
    }, [theme])

    return { theme, setTheme }
}
