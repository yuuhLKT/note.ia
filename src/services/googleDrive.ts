import axios from 'axios'

const GOOGLE_DRIVE_FOLDER = 'Note.IA'
const NOTES_FOLDER = 'Notes'
const TASKS_FOLDER = 'Tasks'
const STORAGE_KEY = 'google_drive_account'

interface GoogleDriveCredentials {
    clientId: string
    scopes: string
}

export interface GoogleDriveFile {
    id: string
    name: string
    mimeType: string
    modifiedTime: string
    size?: string
    iconLink?: string
    webViewLink?: string
}

let credentials: GoogleDriveCredentials = {
    clientId: '1070807535865-9ndlflf5qtsblth21gljoepeu99s96vd.apps.googleusercontent.com',
    scopes: 'https://www.googleapis.com/auth/drive.file'
}

export function setGoogleDriveCredentials(newCredentials: GoogleDriveCredentials) {
    credentials = newCredentials
}

export function getGoogleDriveCredentials() {
    return credentials
}

export function getAccessToken(): string | null {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const account = JSON.parse(stored)
    return account?.access_token || null
}

export async function uploadFile(file: File) {
    const accessToken = getAccessToken()
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

export async function listFiles(folderId?: string | null) {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const rootFolderId = await findOrCreateFolder()
    const query = folderId
        ? `'${folderId}' in parents and trashed=false`
        : `'${rootFolderId}' in parents and trashed=false`

    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    return response.data.files.map((file: GoogleDriveFile) => ({
        ...file,
        modifiedTime: new Date(file.modifiedTime).toISOString()
    }))
}

export async function listTrashedFiles() {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const rootFolderId = await findOrCreateFolder()
    const notesFolderId = await findOrCreateNotesFolder()
    const tasksFolderId = await findOrCreateTasksFolder()

    const query = `('${rootFolderId}' in parents or '${notesFolderId}' in parents or '${tasksFolderId}' in parents) and trashed=true`

    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    return response.data.files.map((file: GoogleDriveFile) => ({
        ...file,
        modifiedTime: new Date(file.modifiedTime).toISOString()
    }))
}

async function findOrCreateFolder() {
    const accessToken = getAccessToken()
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

export async function downloadFile(fileId: string, fileName: string) {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            responseType: 'blob'
        }
    )

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
}

export async function deleteFile(fileId: string) {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    try {
        // Primeiro tenta encontrar o arquivo pelo ID e mover para a lixeira
        await axios.patch(
            `https://www.googleapis.com/drive/v3/files/${fileId}`,
            {
                trashed: true
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )
    } catch (error) {
        console.log('Error moving file to trash, trying to find by name:', error)
        // Se falhar, tenta encontrar o arquivo pelo nome nas pastas específicas
        const notesFolderId = await findOrCreateNotesFolder()
        const tasksFolderId = await findOrCreateTasksFolder()

        // Procura o arquivo nas pastas de notas e tarefas
        const notesResponse = await axios.get(
            `https://www.googleapis.com/drive/v3/files?q=name='${fileId}.md' and '${notesFolderId}' in parents and trashed=false`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )

        const tasksResponse = await axios.get(
            `https://www.googleapis.com/drive/v3/files?q=name='${fileId}.json' and '${tasksFolderId}' in parents and trashed=false`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )

        let fileToTrash = null
        if (notesResponse.data.files.length > 0) {
            fileToTrash = notesResponse.data.files[0]
        } else if (tasksResponse.data.files.length > 0) {
            fileToTrash = tasksResponse.data.files[0]
        }

        if (!fileToTrash) {
            throw new Error('File not found')
        }

        // Move o arquivo encontrado para a lixeira
        await axios.patch(
            `https://www.googleapis.com/drive/v3/files/${fileToTrash.id}`,
            {
                trashed: true
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )
    }
}

async function findOrCreateNotesFolder() {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    // First, find the main Note.IA folder
    const mainFolderId = await findOrCreateFolder()

    // Then, try to find the Notes folder inside it
    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q=name='${NOTES_FOLDER}' and mimeType='application/vnd.google-apps.folder' and '${mainFolderId}' in parents and trashed=false`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    if (response.data.files.length > 0) {
        return response.data.files[0].id
    }

    // If Notes folder doesn't exist, create it
    const createResponse = await axios.post(
        'https://www.googleapis.com/drive/v3/files',
        {
            name: NOTES_FOLDER,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [mainFolderId]
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

export async function saveNoteToDrive(note: {
    id: string
    title: string
    content: string
    createdAt: string
    updatedAt: string
    files?: GoogleDriveFile[]
    links?: string[]
}) {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const notesFolderId = await findOrCreateNotesFolder()

    // First, try to find the existing note
    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q=name='${note.id}.md' and '${notesFolderId}' in parents and trashed=false`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    const metadata = {
        name: `${note.id}.md`,
        mimeType: 'text/markdown',
        parents: [notesFolderId]
    }

    const fileContent = JSON.stringify(note)

    if (response.data.files.length > 0) {
        // Delete the existing file
        const fileId = response.data.files[0].id
        await axios.delete(
            `https://www.googleapis.com/drive/v3/files/${fileId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
    }

    // Create new file
    const formData = new FormData()
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    formData.append('file', new Blob([fileContent], { type: 'application/json' }))

    await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        formData,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    )
}

export async function getNotesFromDrive() {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const notesFolderId = await findOrCreateNotesFolder()
    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q='${notesFolderId}' in parents and mimeType='text/markdown' and trashed=false&fields=files(id,name,mimeType,modifiedTime)`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    const notes = await Promise.all(
        response.data.files.map(async (file: GoogleDriveFile) => {
            try {
                const contentResponse = await axios.get(
                    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                )

                const content = contentResponse.data

                return {
                    id: file.name.replace('.md', ''),
                    title: content.title || 'Untitled Note',
                    content: content.content || '',
                    createdAt: content.createdAt || file.modifiedTime,
                    updatedAt: content.updatedAt || file.modifiedTime,
                    files: content.files || [],
                    links: content.links || []
                }
            } catch (error) {
                console.error('Error loading note:', file.name, error)
                return null
            }
        })
    )

    return notes.filter(note => note !== null)
}

export async function getNoteContent(fileId: string) {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    return response.data
}

async function findOrCreateTasksFolder() {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    // First, find the main Note.IA folder
    const mainFolderId = await findOrCreateFolder()

    // Then, try to find the Tasks folder inside it
    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q=name='${TASKS_FOLDER}' and mimeType='application/vnd.google-apps.folder' and '${mainFolderId}' in parents and trashed=false`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    if (response.data.files.length > 0) {
        return response.data.files[0].id
    }

    // If Tasks folder doesn't exist, create it
    const createResponse = await axios.post(
        'https://www.googleapis.com/drive/v3/files',
        {
            name: TASKS_FOLDER,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [mainFolderId]
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

export async function saveTaskToDrive(task: {
    id: string
    title: string
    description?: string
    column: string
    labels?: string[]
    assignee?: string
    dueDate?: Date
    priority?: string
    attachments?: string[]
    notes?: string[]
}) {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const tasksFolderId = await findOrCreateTasksFolder()

    // First, try to find the existing task
    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q=name='${task.id}.json' and '${tasksFolderId}' in parents and trashed=false`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    const metadata = {
        name: `${task.id}.json`,
        mimeType: 'application/json',
        parents: [tasksFolderId]
    }

    const fileContent = JSON.stringify(task)

    if (response.data.files.length > 0) {
        // Delete the existing file
        const fileId = response.data.files[0].id
        await axios.delete(
            `https://www.googleapis.com/drive/v3/files/${fileId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        )
    }

    // Create new file
    const formData = new FormData()
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    formData.append('file', new Blob([fileContent], { type: 'application/json' }))

    await axios.post(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        formData,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    )
}

export async function getTasksFromDrive() {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    const tasksFolderId = await findOrCreateTasksFolder()
    const response = await axios.get(
        `https://www.googleapis.com/drive/v3/files?q='${tasksFolderId}' in parents and mimeType='application/json' and trashed=false&fields=files(id,name,mimeType,modifiedTime)`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    const tasks = await Promise.all(
        response.data.files.map(async (file: GoogleDriveFile) => {
            const contentResponse = await axios.get(
                `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
            return contentResponse.data
        })
    )

    return tasks
}

export async function restoreFile(fileId: string) {
    const accessToken = getAccessToken()
    if (!accessToken) {
        throw new Error('Not authenticated')
    }

    await axios.patch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
            trashed: false
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    )
} 
