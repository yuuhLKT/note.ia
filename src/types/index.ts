import { GoogleDriveFile } from '@/services/googleDrive'

// Note types
export interface Note {
    id: string
    title: string
    content: string
    createdAt: string
    updatedAt: string
    files: GoogleDriveFile[]
    links?: string[]
}

// Kanban types
export type ColumnType = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type Priority = 'Low' | 'Medium' | 'High'

export interface Task {
    id: string
    title: string
    description?: string
    column: ColumnType
    labels?: string[]
    assignee?: string
    dueDate?: Date
    priority?: Priority
    attachments?: string[]
    notes?: string[]
}

// File types
export interface DriveFile {
    id: string
    name: string
    mimeType: string
    modifiedTime: string
    size?: string
}

// Theme type
export type Theme = 'light' | 'dark'
