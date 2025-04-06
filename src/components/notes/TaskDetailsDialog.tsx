import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useKanbanStore } from '@/store/kanban'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FileText, Trash2 } from 'lucide-react'

interface TaskDetailsDialogProps {
    taskId: string
    isOpen: boolean
    onClose: () => void
}

export function TaskDetailsDialog({
    taskId,
    isOpen,
    onClose,
}: TaskDetailsDialogProps) {
    const { tasks, updateTask } = useKanbanStore()
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return null

    const handleAddFile = (file: File) => {
        const attachments = [...(task.attachments || []), file.name]
        updateTask(taskId, { attachments })
    }

    const handleRemoveFile = (fileName: string) => {
        const attachments = task.attachments?.filter((f) => f !== fileName)
        updateTask(taskId, { attachments })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Task Details</DialogTitle>
                    <DialogDescription>
                        View and manage task information and attachments
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Title</h3>
                        <p className="text-sm">{task.title}</p>
                    </div>

                    {task.description && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Description</h3>
                            <p className="text-sm">{task.description}</p>
                        </div>
                    )}

                    {task.dueDate && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Due Date</h3>
                            <p className="text-sm">
                                {format(task.dueDate, 'PPP', { locale: ptBR })}
                            </p>
                        </div>
                    )}

                    {task.priority && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Priority</h3>
                            <p className="text-sm">{task.priority}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <h3 className="font-semibold">Files</h3>
                        <div className="space-y-2">
                            {task.attachments?.map((file) => (
                                <div
                                    key={file}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm">{file}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveFile(file)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            <div className="flex gap-2">
                                <Input
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            handleAddFile(file)
                                        }
                                    }}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
