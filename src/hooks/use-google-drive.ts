import { useGoogleLogin } from '@react-oauth/google'
import { useState } from 'react'

interface GoogleDriveAccount {
    access_token: string
    expires_in: number
    scope: string
    token_type: string
}

export function useGoogleDrive() {
    const [account, setAccount] = useState<GoogleDriveAccount | null>(null)

    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            setAccount(tokenResponse as GoogleDriveAccount)
        },
        scope: 'https://www.googleapis.com/auth/drive.file',
    })

    const logout = () => {
        setAccount(null)
    }

    const uploadFile = async (file: File) => {
        if (!account) throw new Error('Not connected to Google Drive')

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${account.access_token}`,
            },
            body: formData,
        })

        if (!response.ok) throw new Error('Failed to upload file')

        const fileData = await response.json()
        return {
            id: fileData.id,
            name: file.name,
            mimeType: file.type,
            webViewLink: `https://drive.google.com/file/d/${fileData.id}/view`,
            iconLink: `https://drive-thirdparty.googleusercontent.com/16/type/${file.type}`,
        }
    }

    return {
        isConnected: !!account,
        login,
        logout,
        account,
        uploadFile,
    }
} 