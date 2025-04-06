import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DriveFile {
    id: string
    name: string
    mimeType: string
    webViewLink: string
    iconLink: string
    thumbnailLink?: string
}

export interface Note {
    id: string
    title: string
    content: string
    createdAt: string
    updatedAt: string
    files: DriveFile[]
    links?: string[]
}

interface NotesState {
    notes: Note[]
    addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateNote: (id: string, note: Partial<Note>) => void
    deleteNote: (id: string) => void
}

export const useNotesStore = create<NotesState>()(
    persist(
        (set) => ({
            notes: [],
            addNote: (note) =>
                set((state) => ({
                    notes: [
                        ...state.notes,
                        {
                            ...note,
                            id: crypto.randomUUID(),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            files: note.files || [],
                        },
                    ],
                })),
            updateNote: (id, note) =>
                set((state) => ({
                    notes: state.notes.map((n) =>
                        n.id === id
                            ? {
                                ...n,
                                ...note,
                                updatedAt: new Date().toISOString(),
                            }
                            : n
                    ),
                })),
            deleteNote: (id) =>
                set((state) => ({
                    notes: state.notes.filter((note) => note.id !== id),
                })),
        }),
        {
            name: 'notes-storage',
        }
    )
) 