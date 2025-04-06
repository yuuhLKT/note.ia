import { GoogleDriveFile } from '@/services/googleDrive'

interface RawDriveFile {
    id: string
    name: string
    mimeType: string
    modifiedTime: string
    size?: string
    thumbnailLink?: string
}

export const getDriveFileIcon = (mimeType: string) => {
    return `https://drive-thirdparty.googleusercontent.com/16/type/${mimeType}`
}

export const getDefaultFileIcon = () => {
    return 'https://drive-thirdparty.googleusercontent.com/16/type/application/octet-stream'
}

export const handleFileIconError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = getDefaultFileIcon()
}

export const formatDriveFile = (file: RawDriveFile): GoogleDriveFile & { iconLink: string; webViewLink: string } => {
    return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        modifiedTime: file.modifiedTime,
        size: file.size,
        webViewLink: `https://drive.google.com/file/d/${file.id}/view`,
        iconLink: getDriveFileIcon(file.mimeType)
    }
} 