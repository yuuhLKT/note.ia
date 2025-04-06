/* eslint-disable @typescript-eslint/no-unused-vars */
import { deleteFile, getGoogleDriveCredentials, getNotesFromDrive, saveNoteToDrive } from '@/services/googleDrive'
import type { Note } from '@/types'
import { create } from 'zustand'

interface NotesState {
    notes: Note[]
    isLoading: boolean
    error: string | null
    pendingSync: Set<string> // IDs das notas que precisam ser sincronizadas
    isInitialized: boolean // Flag para controlar se os dados já foram carregados do Drive
    addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'files'>) => Promise<void>
    updateNote: (id: string, note: Partial<Note>) => Promise<void>
    deleteNote: (id: string) => Promise<void>
    loadNotes: () => Promise<void>
    syncWithDrive: () => Promise<void>
}

function checkGoogleDriveConnection() {
    const credentials = getGoogleDriveCredentials()
    return !!credentials.clientId
}

async function performDriveAction(action: () => Promise<void>) {
    const isConnected = checkGoogleDriveConnection()
    if (!isConnected) {
        console.log('Google Drive não está conectado')
        throw new Error('Please connect to Google Drive first')
    }
    await action()
}

export const useNotesStore = create<NotesState>()((set, get) => ({
    notes: [],
    isLoading: false,
    error: null,
    pendingSync: new Set<string>(),
    isInitialized: false,

    addNote: async (note) => {
        console.log('Iniciando adição de nota:', note)
        try {
            const newNote = {
                ...note,
                id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                files: []
            }
            console.log('Nova nota criada:', newNote)

            // Atualiza o store local imediatamente
            set(state => {
                console.log('Atualizando store local com nova nota')
                return {
                    notes: [...state.notes, newNote],
                    pendingSync: new Set(state.pendingSync).add(newNote.id)
                }
            })

            // Agenda a sincronização com o Drive
            console.log('Agendando sincronização para nota:', newNote.id)
            setTimeout(() => get().syncWithDrive(), 2000)
        } catch (error) {
            console.error('Erro ao adicionar nota:', error)
            set({ error: error instanceof Error ? error.message : 'Failed to add note' })
        }
    },

    updateNote: async (id, note) => {
        console.log('Iniciando atualização de nota:', { id, note })
        try {
            const existingNote = get().notes.find(n => n.id === id)
            if (!existingNote) {
                console.error('Nota não encontrada para atualização:', id)
                throw new Error('Note not found')
            }

            const updatedNote = {
                ...existingNote,
                ...note,
                files: note.files || existingNote.files || [],
                updatedAt: new Date().toISOString()
            }
            console.log('Nota atualizada:', updatedNote)

            // Atualiza o store local imediatamente
            set(state => {
                console.log('Atualizando store local com nota atualizada')
                return {
                    notes: state.notes.map(n => n.id === id ? updatedNote : n),
                    pendingSync: new Set(state.pendingSync).add(id)
                }
            })

            // Agenda a sincronização com o Drive
            console.log('Agendando sincronização para nota atualizada:', id)
            setTimeout(() => get().syncWithDrive(), 2000)
        } catch (error) {
            console.error('Erro ao atualizar nota:', error)
            set({ error: error instanceof Error ? error.message : 'Failed to update note' })
        }
    },

    deleteNote: async (id) => {
        console.log('Iniciando exclusão de nota:', id)
        try {
            // Remove do store local imediatamente
            set(state => {
                console.log('Removendo nota do store local')
                return {
                    notes: state.notes.filter(n => n.id !== id),
                    pendingSync: new Set(state.pendingSync).add(id)
                }
            })

            // Agenda a sincronização com o Drive
            console.log('Agendando sincronização para exclusão da nota:', id)
            setTimeout(() => get().syncWithDrive(), 2000)
        } catch (error) {
            console.error('Erro ao excluir nota:', error)
            set({ error: error instanceof Error ? error.message : 'Failed to delete note' })
        }
    },

    loadNotes: async () => {
        const { isInitialized } = get()
        console.log('Iniciando carregamento de notas. Já inicializado?', isInitialized)

        try {
            set({ isLoading: true, error: null })
            await performDriveAction(async () => {
                console.log('Buscando notas do Drive')
                const notes = await getNotesFromDrive()
                console.log('Notas carregadas do Drive:', notes)

                // Limpa o estado local e atualiza com as notas do Drive
                set({
                    notes,
                    pendingSync: new Set<string>(),
                    isInitialized: true
                })
            })
        } catch (error) {
            console.error('Erro ao carregar notas:', error)
            set({ error: error instanceof Error ? error.message : 'Failed to load notes' })
        } finally {
            set({ isLoading: false })
        }
    },

    syncWithDrive: async () => {
        const { notes, pendingSync } = get()
        console.log('Iniciando sincronização com Drive. Notas pendentes:', Array.from(pendingSync))

        try {
            set({ isLoading: true })
            await performDriveAction(async () => {
                // Primeiro, carrega todas as notas do Drive para garantir sincronização
                const driveNotes = await getNotesFromDrive()

                // Cria um mapa de notas do Drive para fácil acesso
                const driveNotesMap = new Map(driveNotes.map(note => [note.id, note]))

                // Sincroniza cada nota pendente
                for (const noteId of pendingSync) {
                    const note = notes.find(n => n.id === noteId)
                    if (note) {
                        console.log('Salvando nota no Drive:', note)
                        await saveNoteToDrive(note)
                        // Atualiza o mapa com a versão mais recente
                        driveNotesMap.set(note.id, note)
                    } else {
                        console.log('Deletando nota do Drive:', noteId)
                        try {
                            await deleteFile(noteId)
                            driveNotesMap.delete(noteId)
                        } catch (_) {
                            console.log('Nota já não existe no Drive:', noteId)
                        }
                    }
                }

                // Combina as notas do Drive com as notas locais, priorizando as locais
                const mergedNotes = Array.from(driveNotesMap.values())
                const localNotes = notes.filter(note => !driveNotesMap.has(note.id))
                const finalNotes = [...mergedNotes, ...localNotes]

                // Atualiza o estado local com as notas combinadas
                set({
                    notes: finalNotes,
                    pendingSync: new Set<string>()
                })
            })
        } catch (error) {
            console.error('Erro durante sincronização:', error)
            set(state => ({
                pendingSync: new Set<string>(),
                notes: state.notes
            }))
        } finally {
            set({ isLoading: false })
        }
    }
})) 