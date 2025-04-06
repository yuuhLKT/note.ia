import { FileUploadModal } from '@/components/files/FileUploadModal'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { listFiles } from '@/services/googleDrive'
import { useKanbanStore } from '@/store/kanban'
import { useNotesStore } from '@/store/notes'
import { ColumnType, Priority } from '@/types'
import { format } from 'date-fns'
import { CalendarIcon, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DriveFile {
    id: string
    name: string
    mimeType: string
    modifiedTime: string
    size?: string
}

interface EditTaskDialogProps {
    isOpen: boolean
    onClose: () => void
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

export function EditTaskDialog({ isOpen, onClose, task }: EditTaskDialogProps) {
    const { updateTask } = useKanbanStore()
    const { notes } = useNotesStore()
    const { isConnected } = useGoogleDrive()
    const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
    const [editedTask, setEditedTask] = useState({
        ...task,
        dueDate: task.dueDate || new Date(),
    })
    const [newLabel, setNewLabel] = useState('')
    const [attachments, setAttachments] = useState<File[]>([])
    const [selectedExistingFiles, setSelectedExistingFiles] = useState<
        string[]
    >(task.attachments || [])
    const [selectedNotes, setSelectedNotes] = useState<string[]>(
        task.notes || []
    )

    useEffect(() => {
        if (isConnected) {
            loadDriveFiles()
        }
    }, [isConnected])

    const loadDriveFiles = async () => {
        try {
            const files = await listFiles()
            setDriveFiles(files)
        } catch (error) {
            console.error('Error loading drive files:', error)
        }
    }

    const handleSave = () => {
        updateTask(task.id, {
            ...editedTask,
            attachments: [
                ...selectedExistingFiles,
                ...attachments.map((file) => file.name),
            ],
            notes: selectedNotes,
        })
        onClose()
    }

    const handleLabelKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newLabel.trim()) {
            setEditedTask({
                ...editedTask,
                labels: [...(editedTask.labels || []), newLabel.trim()],
            })
            setNewLabel('')
        }
    }

    const removeLabel = (labelToRemove: string) => {
        setEditedTask({
            ...editedTask,
            labels: editedTask.labels?.filter(
                (label) => label !== labelToRemove
            ),
        })
    }

    const handleFileUpload = (files: File[]) => {
        setAttachments([...attachments, ...files])
    }

    const handleRemoveAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index))
    }

    const handleRemoveExistingFile = (fileId: string) => {
        setSelectedExistingFiles(
            selectedExistingFiles.filter((id) => id !== fileId)
        )
    }

    const handleRemoveNote = (noteId: string) => {
        setSelectedNotes((prev) => prev.filter((id) => id !== noteId))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Edit task details and information
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={editedTask.title}
                            onChange={(e) =>
                                setEditedTask({
                                    ...editedTask,
                                    title: e.target.value,
                                })
                            }
                            placeholder="Enter task title"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={editedTask.description}
                            onChange={(e) =>
                                setEditedTask({
                                    ...editedTask,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Enter task description"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="assignee">Assignee</Label>
                        <Input
                            id="assignee"
                            value={editedTask.assignee}
                            onChange={(e) =>
                                setEditedTask({
                                    ...editedTask,
                                    assignee: e.target.value,
                                })
                            }
                            placeholder="Enter assignee name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={
                                    editedTask.dueDate
                                        ? format(
                                              editedTask.dueDate,
                                              'yyyy-MM-dd'
                                          )
                                        : ''
                                }
                                onChange={(e) =>
                                    setEditedTask({
                                        ...editedTask,
                                        dueDate: new Date(e.target.value),
                                    })
                                }
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                    setEditedTask({
                                        ...editedTask,
                                        dueDate: new Date(),
                                    })
                                }
                            >
                                <CalendarIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select
                            value={editedTask.priority}
                            onValueChange={(value: Priority) =>
                                setEditedTask({
                                    ...editedTask,
                                    priority: value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={editedTask.column}
                            onValueChange={(value: ColumnType) =>
                                setEditedTask({
                                    ...editedTask,
                                    column: value,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todo">To Do</SelectItem>
                                <SelectItem value="in-progress">
                                    In Progress
                                </SelectItem>
                                <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Labels</Label>
                        <div className="flex flex-wrap gap-2">
                            {editedTask.labels?.map((label) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                                >
                                    <span>{label}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4"
                                        onClick={() => removeLabel(label)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Input
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            onKeyDown={handleLabelKeyDown}
                            placeholder="Press Enter to add label"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Attachments</Label>
                        <div className="space-y-2">
                            <FileUploadModal
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload New Files
                                    </Button>
                                }
                                onUploadComplete={handleFileUpload}
                            />
                            {attachments.length > 0 && (
                                <div className="space-y-2">
                                    {attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                        >
                                            <span className="text-sm">
                                                {file.name}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleRemoveAttachment(
                                                        index
                                                    )
                                                }
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Existing Files</Label>
                        <div className="space-y-2">
                            {driveFiles.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                    <span className="text-sm">{file.name}</span>
                                    <Button
                                        variant={
                                            selectedExistingFiles.includes(
                                                file.id
                                            )
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => {
                                            if (
                                                selectedExistingFiles.includes(
                                                    file.id
                                                )
                                            ) {
                                                handleRemoveExistingFile(
                                                    file.id
                                                )
                                            } else {
                                                setSelectedExistingFiles([
                                                    ...selectedExistingFiles,
                                                    file.id,
                                                ])
                                            }
                                        }}
                                    >
                                        {selectedExistingFiles.includes(file.id)
                                            ? 'Selected'
                                            : 'Select'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Linked Notes</Label>
                        <div className="space-y-2">
                            <Select
                                value=""
                                onValueChange={(value) => {
                                    if (
                                        value &&
                                        !selectedNotes.includes(value)
                                    ) {
                                        setSelectedNotes([
                                            ...selectedNotes,
                                            value,
                                        ])
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select notes to link" />
                                </SelectTrigger>
                                <SelectContent>
                                    {notes
                                        .filter(
                                            (note) =>
                                                !selectedNotes.includes(note.id)
                                        )
                                        .map((note) => (
                                            <SelectItem
                                                key={note.id}
                                                value={note.id}
                                            >
                                                {note.title}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            {selectedNotes.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    {selectedNotes.map((noteId) => {
                                        const note = notes.find(
                                            (n) => n.id === noteId
                                        )
                                        return (
                                            <div
                                                key={noteId}
                                                className="flex items-center gap-1"
                                            >
                                                <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                                    {note?.title}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        handleRemoveNote(noteId)
                                                    }
                                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
