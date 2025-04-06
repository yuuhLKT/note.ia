import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useKanbanStore } from '@/store/kanban'
import { useNotesStore } from '@/store/notes'
import { ColumnType, Priority } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EditTaskDialog } from './EditTaskDialog'

interface KanbanCardProps {
    task: {
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
}

export function KanbanCard({ task }: KanbanCardProps) {
    const navigate = useNavigate()
    const { deleteTask } = useKanbanStore()
    const { notes } = useNotesStore()
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        deleteTask(task.id)
    }

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsEditDialogOpen(true)
    }

    const getPriorityColor = (priority?: Priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            case 'low':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
        }
    }

    const handleNoteClick = (noteId: string) => {
        navigate(`/notes/editor/${noteId}`)
    }

    return (
        <>
            <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setIsDetailsOpen(true)}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleEdit}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {task.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                        {task.description}
                    </p>
                )}
                {task.assignee && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                        Assigned to: {task.assignee}
                    </p>
                )}
                {task.dueDate && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                        Due: {format(task.dueDate, 'MM/dd/yyyy')}
                    </p>
                )}
                {task.priority && (
                    <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${getPriorityColor(
                            task.priority
                        )}`}
                    >
                        {task.priority}
                    </span>
                )}
                {task.labels && task.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {task.labels.map((label) => (
                            <span
                                key={label}
                                className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                )}
                {task.attachments?.length || task.notes?.length ? (
                    <div className="flex items-center gap-2 mt-2">
                        {task.attachments && task.attachments.length > 0 && (
                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                                <FileText className="h-4 w-4" />
                                {task.attachments.length} file
                                {task.attachments.length > 1 ? 's' : ''}
                            </span>
                        )}
                        {task.notes && task.notes.length > 0 && (
                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                                <FileText className="h-4 w-4" />
                                {task.notes.length} note
                                {task.notes.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                ) : null}
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{task.title}</DialogTitle>
                        <DialogDescription>
                            Task details and information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {task.description && (
                            <div>
                                <h4 className="font-medium mb-1">
                                    Description
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {task.description}
                                </p>
                            </div>
                        )}
                        {task.assignee && (
                            <div>
                                <h4 className="font-medium mb-1">Assignee</h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {task.assignee}
                                </p>
                            </div>
                        )}
                        {task.dueDate && (
                            <div>
                                <h4 className="font-medium mb-1">Due Date</h4>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {format(task.dueDate, 'MM/dd/yyyy', {
                                        locale: ptBR,
                                    })}
                                </p>
                            </div>
                        )}
                        {task.priority && (
                            <div>
                                <h4 className="font-medium mb-1">Priority</h4>
                                <span
                                    className={`inline-block px-2 py-1 text-xs rounded-full ${getPriorityColor(
                                        task.priority
                                    )}`}
                                >
                                    {task.priority}
                                </span>
                            </div>
                        )}
                        {task.labels && task.labels.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-1">Labels</h4>
                                <div className="flex flex-wrap gap-2">
                                    {task.labels.map((label) => (
                                        <span
                                            key={label}
                                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                        >
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {task.attachments && task.attachments.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-1">
                                    Attachments
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {task.attachments.map((file) => (
                                        <span
                                            key={file}
                                            className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                        >
                                            {file}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {task.notes && task.notes.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-1">
                                    Linked Notes
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {task.notes.map((noteId) => {
                                        const note = notes.find(
                                            (n) => n.id === noteId
                                        )
                                        return (
                                            <span
                                                key={noteId}
                                                className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                                onClick={() =>
                                                    handleNoteClick(noteId)
                                                }
                                            >
                                                {note?.title}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <EditTaskDialog
                taskId={task.id}
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
            />
        </>
    )
}
