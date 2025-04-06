import type { ColumnType, Priority, Task } from '@/types'
import { create } from 'zustand'

interface KanbanState {
    tasks: Task[]
    addTask: (task: {
        title: string
        description?: string
        column: ColumnType
        labels?: string[]
        assignee?: string
        dueDate?: Date
        priority?: Priority
        attachments?: string[]
        notes?: string[]
    }) => void
    updateTask: (id: string, task: Partial<Task>) => void
    moveTask: (id: string, column: Task['column']) => void
    deleteTask: (id: string) => void
    removeTask: (taskId: string) => void
}

export const useKanbanStore = create<KanbanState>((set) => ({
    tasks: [],
    addTask: (task) =>
        set((state) => ({
            tasks: [
                ...state.tasks,
                {
                    ...task,
                    id: Math.random().toString(36).substr(2, 9),
                },
            ],
        })),
    updateTask: (id, task) =>
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, ...task } : t
            ),
        })),
    moveTask: (id, column) =>
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, column } : t
            ),
        })),
    deleteTask: (id) =>
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
        })),
    removeTask: (taskId) =>
        set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
}))
