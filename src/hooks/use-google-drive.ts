import { useGoogleDriveAuth } from '@/services/googleDrive'
import { useEffect, useState } from 'react'

export function useGoogleDrive() {
    const { login, logout, isAuthenticated, account } = useGoogleDriveAuth()
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        setIsConnected(isAuthenticated)
    }, [isAuthenticated])

    return {
        isConnected,
        login,
        logout,
        account
    }
} 