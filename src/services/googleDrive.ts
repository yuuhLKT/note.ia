import { googleLogout, useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'

const GOOGLE_DRIVE_FOLDER = 'Note.IA'

interface GoogleDriveCredentials {
    clientId: string
    scopes: string
}

interface GoogleDriveAccount {
    email: string
    name: string
    picture: string
}

let credentials: GoogleDriveCredentials = {
    clientId: '1070807535865-9ndlflf5qtsblth21gljoepeu99s96vd.apps.googleusercontent.com',
    scopes: 'https://www.googleapis.com/auth/drive.file'
}

let accessToken: string | null = null
let account: GoogleDriveAccount | null = null

export function setGoogleDriveCredentials(newCredentials: GoogleDriveCredentials) {
    credentials = newCredentials
}

export function getGoogleDriveCredentials() {
    return credentials
}

export function useGoogleDriveAuth() {
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            accessToken = tokenResponse.access_token
            // Get user info
            axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            }).then(response => {
                account = {
                    email: response.data.email,
                    name: response.data.name,
                    picture: response.data.picture
                }
            })
        },
        onError: (error) => {
            console.error('Login Failed:', error)
        },
        scope: credentials.scopes,
        clientId: credentials.clientId
    })

    const logout = () => {
        googleLogout()
        accessToken = null
        account = null
    }

    return {
        login,
        logout,
        isAuthenticated: !!accessToken,
        account
    }
}

export async function uploadFile(file: File) {
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    // First, check if the folder exists
    const folderId = await findOrCreateFolder()

    const formData = new FormData()
    formData.append('metadata', new Blob([JSON.stringify({
        name: file.name,
        parents: [folderId]
    })], { type: 'application/json' }))
    formData.append('file', file)

    const response = await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        formData,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    )

    return response.data
}

export async function listFiles() {
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const folderId = await findOrCreateFolder()
    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    return response.data.files
}

async function findOrCreateFolder() {
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    // First, try to find the folder
    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q=name='${GOOGLE_DRIVE_FOLDER}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    if (response.data.files.length > 0) {
        return response.data.files[0].id
    }

    // If folder doesn't exist, create it
    const createResponse = await axios.post(
        'https://www.googleapis.com/drive/v3/files',
        {
            name: GOOGLE_DRIVE_FOLDER,
            mimeType: 'application/vnd.google-apps.folder'
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    )

    return createResponse.data.id
} 