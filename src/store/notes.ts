import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NoteFile {
    id: string
    name: string
    type: string
    size: number
    url: string
}

interface Note {
    id: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
    links?: string[]
    files?: NoteFile[]
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
                            id: Math.random().toString(36).substr(2, 9),
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    ],
                })),
            updateNote: (id, note) =>
                set((state) => ({
                    notes: state.notes.map((n) =>
                        n.id === id
                            ? { ...n, ...note, updatedAt: new Date() }
                            : n
                    ),
                })),
            deleteNote: (id) =>
                set((state) => ({
                    notes: state.notes.filter((n) => n.id !== id),
                })),
        }),
        {
            name: 'notes-storage',
        }
    )
) 