import { deleteFile, getGoogleDriveCredentials, getTasksFromDrive, saveTaskToDrive } from '@/services/googleDrive'
import type { ColumnType, Task } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface KanbanState {
    tasks: Task[]
    isLoading: boolean
    error: string | null
    isInitialized: boolean
    pendingSync: Set<string>
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
    updateTask: (id: string, task: Partial<Task>) => Promise<void>
    moveTask: (id: string, column: ColumnType) => Promise<void>
    deleteTask: (id: string) => Promise<void>
    removeTask: (id: string) => Promise<void>
    loadTasks: () => Promise<void>
    syncWithDrive: () => Promise<void>
    syncFromDrive: () => Promise<void>
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

export const useKanbanStore = create<KanbanState>()(
    persist(
        (set, get) => ({
            tasks: [],
            isLoading: false,
            error: null,
            isInitialized: false,
            pendingSync: new Set<string>(),

            addTask: async (task) => {
                console.log('Iniciando adição de task:', task)
                try {
                    const newTask = {
                        ...task,
                        id: Math.random().toString(36).substr(2, 9),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                    console.log('Nova task criada:', newTask)

                    // Atualiza o store local imediatamente
                    set(state => {
                        const currentPendingSync = state.pendingSync || new Set<string>()
                        return {
                            tasks: [...state.tasks, newTask],
                            pendingSync: new Set([...currentPendingSync, newTask.id])
                        }
                    })

                    // Agenda a sincronização com o Drive
                    console.log('Agendando sincronização para task:', newTask.id)
                    setTimeout(() => get().syncWithDrive(), 2000)
                } catch (error) {
                    console.error('Erro ao adicionar task:', error)
                    set({ error: error instanceof Error ? error.message : 'Failed to add task' })
                }
            },

            updateTask: async (id, task) => {
                console.log('Iniciando atualização de task:', { id, task })
                try {
                    const existingTask = get().tasks.find(t => t.id === id)
                    if (!existingTask) {
                        console.error('Task não encontrada para atualização:', id)
                        throw new Error('Task not found')
                    }

                    const updatedTask = {
                        ...existingTask,
                        ...task,
                        attachments: task.attachments !== undefined ? task.attachments : existingTask.attachments,
                        updatedAt: new Date().toISOString()
                    }
                    console.log('Task atualizada:', updatedTask)

                    // Atualiza o store local imediatamente
                    set(state => {
                        const currentPendingSync = state.pendingSync || new Set<string>()
                        return {
                            tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
                            pendingSync: new Set([...currentPendingSync, id])
                        }
                    })

                    // Agenda a sincronização com o Drive
                    console.log('Agendando sincronização para task atualizada:', id)
                    setTimeout(() => get().syncWithDrive(), 2000)
                } catch (error) {
                    console.error('Erro ao atualizar task:', error)
                    set({ error: error instanceof Error ? error.message : 'Failed to update task' })
                }
            },

            moveTask: async (id, column) => {
                console.log('Iniciando movimentação de task:', { id, column })
                try {
                    const existingTask = get().tasks.find(t => t.id === id)
                    if (!existingTask) {
                        console.error('Task não encontrada para movimentação:', id)
                        throw new Error('Task not found')
                    }

                    const updatedTask = {
                        ...existingTask,
                        column,
                        updatedAt: new Date().toISOString()
                    }
                    console.log('Task movida:', updatedTask)

                    // Atualiza o store local imediatamente
                    set(state => ({
                        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
                        pendingSync: new Set(state.pendingSync).add(id)
                    }))

                    // Agenda a sincronização com o Drive
                    console.log('Agendando sincronização para task movida:', id)
                    setTimeout(() => get().syncWithDrive(), 2000)
                } catch (error) {
                    console.error('Erro ao mover task:', error)
                    set({ error: error instanceof Error ? error.message : 'Failed to move task' })
                }
            },

            deleteTask: async (id) => {
                console.log('Iniciando exclusão de task:', id)
                try {
                    // Remove do store local imediatamente
                    set(state => ({
                        tasks: state.tasks.filter(t => t.id !== id),
                        pendingSync: new Set(state.pendingSync).add(id)
                    }))

                    // Agenda a sincronização com o Drive
                    console.log('Agendando sincronização para exclusão da task:', id)
                    setTimeout(() => get().syncWithDrive(), 2000)
                } catch (error) {
                    console.error('Erro ao excluir task:', error)
                    set({ error: error instanceof Error ? error.message : 'Failed to delete task' })
                }
            },

            removeTask: async (id) => {
                console.log('Iniciando remoção de task:', id)
                try {
                    // Remove do store local imediatamente
                    set(state => ({
                        tasks: state.tasks.filter(t => t.id !== id),
                        pendingSync: new Set(state.pendingSync).add(id)
                    }))

                    // Agenda a sincronização com o Drive
                    console.log('Agendando sincronização para remoção da task:', id)
                    setTimeout(() => get().syncWithDrive(), 2000)
                } catch (error) {
                    console.error('Erro ao remover task:', error)
                    set({ error: error instanceof Error ? error.message : 'Failed to remove task' })
                }
            },

            loadTasks: async () => {
                const { isInitialized } = get()
                console.log('Iniciando carregamento de tasks. Já inicializado?', isInitialized)

                try {
                    set({ isLoading: true, error: null })
                    await performDriveAction(async () => {
                        console.log('Buscando tasks do Drive')
                        const tasks = await getTasksFromDrive()
                        console.log('Tasks carregadas do Drive:', tasks)

                        // Limpa o estado local e atualiza com as tasks do Drive
                        set({
                            tasks,
                            pendingSync: new Set<string>(),
                            isInitialized: true
                        })
                    })
                } catch (error) {
                    console.error('Erro ao carregar tasks:', error)
                    set({ error: error instanceof Error ? error.message : 'Failed to load tasks' })
                } finally {
                    set({ isLoading: false })
                }
            },

            syncWithDrive: async () => {
                const { tasks, pendingSync } = get()
                console.log('Iniciando sincronização com Drive. Tasks pendentes:', Array.from(pendingSync))

                try {
                    set({ isLoading: true })
                    await performDriveAction(async () => {
                        // Primeiro, carrega todas as tasks do Drive para garantir sincronização
                        const driveTasks = await getTasksFromDrive()

                        // Cria um mapa de tasks do Drive para fácil acesso
                        const driveTasksMap = new Map(driveTasks.map(task => [task.id, task]))

                        // Sincroniza cada task pendente
                        for (const taskId of pendingSync) {
                            const task = tasks.find(t => t.id === taskId)
                            if (task) {
                                console.log('Salvando task no Drive:', task)
                                await saveTaskToDrive(task)
                                // Atualiza o mapa com a versão mais recente
                                driveTasksMap.set(task.id, task)
                            } else {
                                console.log('Deletando task do Drive:', taskId)
                                try {
                                    await deleteFile(taskId)
                                    driveTasksMap.delete(taskId)
                                } catch (_) {
                                    console.log('Task já não existe no Drive:', taskId)
                                }
                            }
                        }

                        // Combina as tasks do Drive com as tasks locais, priorizando as locais
                        const mergedTasks = Array.from(driveTasksMap.values())
                        const localTasks = tasks.filter(task => !driveTasksMap.has(task.id))
                        const finalTasks = [...mergedTasks, ...localTasks]

                        // Atualiza o estado local com as tasks combinadas
                        set({
                            tasks: finalTasks,
                            pendingSync: new Set<string>()
                        })
                    })
                } catch (error) {
                    console.error('Erro durante sincronização:', error)
                    set(state => ({
                        pendingSync: new Set<string>(),
                        tasks: state.tasks
                    }))
                } finally {
                    set({ isLoading: false })
                }
            },

            syncFromDrive: async () => {
                try {
                    set({ isLoading: true, error: null })
                    await performDriveAction(async () => {
                        console.log('Buscando tasks do Drive')
                        const tasks = await getTasksFromDrive()
                        console.log('Tasks carregadas do Drive:', tasks)
                        set({
                            tasks,
                            pendingSync: new Set<string>(),
                            isInitialized: true
                        })
                    })
                } catch (error) {
                    console.error('Erro ao sincronizar do Drive:', error)
                    set({ error: error instanceof Error ? error.message : 'Failed to sync from Drive' })
                } finally {
                    set({ isLoading: false })
                }
            }
        }),
        {
            name: 'kanban-storage',
        }
    )
)
