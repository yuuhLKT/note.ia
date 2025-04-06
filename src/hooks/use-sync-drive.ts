import { useKanbanStore } from '@/store/kanban'
import { useNotesStore } from '@/store/notes'
import { useEffect } from 'react'
import { useGoogleDrive } from './use-google-drive'
import { useToast } from './use-toast'

export function useSyncDrive() {
    const { isConnected } = useGoogleDrive()
    const { loadNotes } = useNotesStore()
    const { loadTasks } = useKanbanStore()
    const { toast } = useToast()

    useEffect(() => {
        loadNotes()
        loadTasks()
    }, [loadNotes, loadTasks])

    const sync = async () => {
        if (!isConnected) {
            toast({
                title: 'Error',
                description: 'Please connect to Google Drive first',
                variant: 'destructive',
            })
            throw new Error('Please connect to Google Drive first')
        }

        try {
            await Promise.all([loadNotes(), loadTasks()])
            toast({
                title: 'Success',
                description: 'Data synchronized successfully',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to sync data',
                variant: 'destructive',
            })
            throw error
        }
    }

    const syncAfterAction = async (action: () => Promise<void>) => {
        try {
            await action()
            await sync()
        } catch (error) {
            console.error('Error in syncAfterAction:', error)
        }
    }

    return { sync, syncAfterAction }
} 