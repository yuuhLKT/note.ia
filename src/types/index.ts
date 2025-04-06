// Note types
export interface Note {
    id: string
    content: string
    lastEdited: Date
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
    type: string
    thumbnailUrl?: string
    lastModified: Date
    size: number
    url?: string
}

// Theme type
export type Theme = 'light' | 'dark'
