import { create } from 'zustand'

interface GoogleDriveAccount {
    access_token: string
    expires_in: number
    scope: string
    token_type: string
}

interface UserProfile {
    name: string
    email: string
    picture: string
}

interface GoogleDriveState {
    isConnected: boolean
    account: GoogleDriveAccount | null
    profile: UserProfile | null
    setAccount: (account: GoogleDriveAccount | null) => void
    setProfile: (profile: UserProfile | null) => void
    logout: () => void
    uploadFile: (file: File) => Promise<{
        id: string
        name: string
        mimeType: string
        webViewLink: string
        iconLink: string
    }>
}

const STORAGE_KEY = 'google_drive_account'
const PROFILE_STORAGE_KEY = 'google_drive_profile'

export const useGoogleDrive = create<GoogleDriveState>((set, get) => ({
    isConnected: false,
    account: null,
    profile: null,
    setAccount: (account) => {
        set({ account, isConnected: !!account })
        if (account) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(account))
            // Fetch user profile when account is set
            fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${account.access_token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    const userProfile = {
                        name: data.name,
                        email: data.email,
                        picture: data.picture,
                    }
                    get().setProfile(userProfile)
                })
                .catch(console.error)
        }
    },
    setProfile: (profile) => {
        set({ profile })
        if (profile) {
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
        } else {
            localStorage.removeItem(PROFILE_STORAGE_KEY)
        }
    },
    logout: () => {
        set({ account: null, profile: null, isConnected: false })
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(PROFILE_STORAGE_KEY)
    },
    uploadFile: async (file) => {
        const { account } = get()
        if (!account) throw new Error('Not authenticated')

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
    },
}))

// Initialize state from localStorage
try {
    const storedAccount = localStorage.getItem(STORAGE_KEY)
    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY)

    if (storedAccount) {
        const account = JSON.parse(storedAccount)
        useGoogleDrive.getState().setAccount(account)
    }

    if (storedProfile) {
        const profile = JSON.parse(storedProfile)
        useGoogleDrive.getState().setProfile(profile)
    }
} catch (error) {
    console.error('Error initializing Google Drive state:', error)
} 