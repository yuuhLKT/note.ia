import { Button } from '@/components/ui/button'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
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
import { Task } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface DriveFile {
    id: string
    name: string
    mimeType: string
    modifiedTime: string
    size?: string
}

interface EditTaskDialogProps {
    taskId: string
    isOpen: boolean
    onClose: () => void
}

export function EditTaskDialog({
    taskId,
    isOpen,
    onClose,
}: EditTaskDialogProps) {
    const { tasks, updateTask } = useKanbanStore()
    const { notes } = useNotesStore()
    const { isConnected } = useGoogleDrive()
    const [driveFiles, setDriveFiles] = useState<
        Array<{ id: string; name: string }>
    >([])
    const [dateError, setDateError] = useState('')
    const [showCalendar, setShowCalendar] = useState(false)
    const [currentLabel, setCurrentLabel] = useState('')
    const [attachments, setAttachments] = useState<(File | string)[]>([])
    const [selectedExistingFiles, setSelectedExistingFiles] = useState<
        string[]
    >([])
    const [selectedNotes, setSelectedNotes] = useState<string[]>([])
    const [editedTask, setEditedTask] = useState<Task | null>(null)

    const loadDriveFiles = useCallback(async () => {
        if (!isConnected) return
        try {
            const files = await listFiles()
            setDriveFiles(
                files.map((file: DriveFile) => ({
                    id: file.id,
                    name: file.name,
                }))
            )
        } catch (error) {
            console.error('Error loading drive files:', error)
        }
    }, [isConnected])

    useEffect(() => {
        if (isConnected) {
            loadDriveFiles()
        }
    }, [isConnected, loadDriveFiles])

    useEffect(() => {
        if (tasks.find((t) => t.id === taskId)) {
            const task = tasks.find((t) => t.id === taskId)
            if (task) {
                setEditedTask({ ...task })
                setAttachments(task.attachments?.map((file) => file) || [])
                setSelectedExistingFiles(task.attachments || [])
                setSelectedNotes(task.notes || [])
            }
        }
    }, [tasks, taskId])

    const task = tasks.find((t) => t.id === taskId)
    if (!task || !editedTask) return null

    const handleFileUpload = (files?: File[]) => {
        if (files) {
            setAttachments((prev) => [...prev, ...files])
        }
    }

    const handleRemoveAttachment = (fileId: string) => {
        setSelectedExistingFiles((prev) => prev.filter((id) => id !== fileId))
        setAttachments((prev) =>
            prev.filter((attachment) =>
                typeof attachment === 'string' ? attachment !== fileId : true
            )
        )
    }

    const handleRemoveNote = (noteId: string) => {
        setSelectedNotes((prev) => prev.filter((id) => id !== noteId))
    }

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (date < today) {
                setDateError('Date cannot be in the past')
                return
            }
            setDateError('')
        }
        setEditedTask({ ...editedTask, dueDate: date })
        setShowCalendar(false)
    }

    const handleLabelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentLabel(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentLabel.trim()) {
            e.preventDefault()
            setEditedTask({
                ...editedTask,
                labels: [...(editedTask.labels || []), currentLabel.trim()],
            })
            setCurrentLabel('')
        }
    }

    const handleSaveChanges = () => {
        // Combine only the new files with the selected existing files
        const newFiles = attachments
            .filter((attachment) => typeof attachment !== 'string')
            .map((attachment) => (attachment as File).name)

        const updatedAttachments = [...newFiles, ...selectedExistingFiles]

        updateTask(task.id, {
            ...editedTask,
            attachments: updatedAttachments,
            notes: selectedNotes,
        })
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Update task details and settings
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
                        <Label>Labels</Label>
                        <div className="space-y-2">
                            <Input
                                value={currentLabel}
                                onChange={handleLabelsChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a label and press Enter"
                            />
                            {(editedTask.labels?.length ?? 0) > 0 && (
                                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    {editedTask.labels?.map((label: string) => (
                                        <div
                                            key={label}
                                            className="flex items-center gap-1"
                                        >
                                            <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                                                {label}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setEditedTask({
                                                        ...editedTask,
                                                        labels:
                                                            editedTask.labels?.filter(
                                                                (l: string) =>
                                                                    l !== label
                                                            ) || [],
                                                    })
                                                }
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Popover
                            open={showCalendar}
                            onOpenChange={setShowCalendar}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {editedTask.dueDate ? (
                                        format(editedTask.dueDate, 'PPP', {
                                            locale: ptBR,
                                        })
                                    ) : (
                                        <span>Select a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <CalendarPicker
                                    mode="single"
                                    selected={editedTask.dueDate}
                                    onSelect={handleDateChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {dateError && (
                            <p className="text-sm text-red-500">{dateError}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Priority</Label>
                        <div className="flex gap-2">
                            {(['Low', 'Medium', 'High'] as const).map(
                                (priority) => (
                                    <Button
                                        key={priority}
                                        variant={
                                            editedTask.priority === priority
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() =>
                                            setEditedTask({
                                                ...editedTask,
                                                priority,
                                            })
                                        }
                                        className="flex-1"
                                    >
                                        {priority}
                                    </Button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Attachments</Label>
                        <div className="space-y-2">
                            {selectedExistingFiles.length > 0 && (
                                <div className="space-y-2">
                                    {selectedExistingFiles.map((fileId) => {
                                        const file = driveFiles.find(
                                            (f) => f.id === fileId
                                        )
                                        return (
                                            <div
                                                key={fileId}
                                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                            >
                                                <span className="text-sm">
                                                    {file?.name || fileId}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleRemoveAttachment(
                                                            fileId
                                                        )
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Select
                                    value=""
                                    onValueChange={(value) => {
                                        if (
                                            value &&
                                            !selectedExistingFiles.includes(
                                                value
                                            )
                                        ) {
                                            setSelectedExistingFiles((prev) => [
                                                ...prev,
                                                value,
                                            ])
                                        }
                                    }}
                                >
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Add existing file" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {driveFiles.length > 0 ? (
                                            driveFiles
                                                .filter(
                                                    (file) =>
                                                        !selectedExistingFiles.includes(
                                                            file.id
                                                        )
                                                )
                                                .map((file) => (
                                                    <SelectItem
                                                        key={file.id}
                                                        value={file.id}
                                                        className="cursor-pointer"
                                                    >
                                                        {file.name}
                                                    </SelectItem>
                                                ))
                                        ) : (
                                            <div className="p-2 text-sm text-muted-foreground">
                                                No files available from Google
                                                Drive
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            handleFileUpload(
                                                Array.from(e.target.files)
                                            )
                                        }
                                    }}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() =>
                                        document
                                            .getElementById('file-upload')
                                            ?.click()
                                    }
                                    disabled={!isConnected}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {!isConnected
                                        ? 'Connect to Google Drive first'
                                        : 'Upload Files'}
                                </Button>
                            </div>
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

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveChanges}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
