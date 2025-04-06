import { TokenResponse, useGoogleLogin } from '@react-oauth/google'
import { useGoogleDrive } from './use-google-drive'

interface GoogleDriveConnection {
    login: () => void
}

export function useGoogleDriveConnection(): GoogleDriveConnection {
    const { setAccount } = useGoogleDrive()

    const login = useGoogleLogin({
        onSuccess: (tokenResponse: TokenResponse) => {
            setAccount({
                access_token: tokenResponse.access_token,
                expires_in: tokenResponse.expires_in,
                scope: tokenResponse.scope || '',
                token_type: tokenResponse.token_type || 'Bearer',
            })
        },
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    })

    return { login }
} 