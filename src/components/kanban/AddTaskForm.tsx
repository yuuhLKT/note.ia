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
import type { ColumnType, Priority } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, ExternalLink, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface DriveFile {
    id: string
    name: string
    mimeType: string
    modifiedTime: string
    size?: string
}

interface AddTaskFormProps {
    onClose: () => void
}

export function AddTaskForm({ onClose }: AddTaskFormProps) {
    const { addTask } = useKanbanStore()
    const { notes } = useNotesStore()
    const { isConnected } = useGoogleDrive()
    const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        column: 'TODO' as ColumnType,
        labels: [] as string[],
        assignee: '',
        dueDate: undefined as Date | undefined,
        priority: 'Medium' as Priority,
        attachments: [] as string[],
    })
    const [dateError, setDateError] = useState('')
    const [showCalendar, setShowCalendar] = useState(false)
    const [currentLabel, setCurrentLabel] = useState('')
    const [attachments, setAttachments] = useState<(File | string)[]>([])
    const [selectedExistingFiles, setSelectedExistingFiles] = useState<
        string[]
    >([])
    const [selectedNotes, setSelectedNotes] = useState<string[]>([])

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

    const handleFileUpload = (files?: File[]) => {
        if (files) {
            setAttachments([...attachments, ...files])
        } else {
            loadDriveFiles()
        }
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
        setSelectedNotes(selectedNotes.filter((id) => id !== noteId))
    }

    const handleAddTask = () => {
        if (dateError) return

        const priority = newTask.priority || 'Medium'
        const selectedFiles = driveFiles
            .filter((file) => selectedExistingFiles.includes(file.id))
            .map((file) => file.name)

        addTask({
            ...newTask,
            priority: (priority.charAt(0).toUpperCase() +
                priority.slice(1).toLowerCase()) as Priority,
            attachments: [
                ...newTask.attachments,
                ...attachments.map((attachment) =>
                    typeof attachment === 'string'
                        ? attachment
                        : attachment.name
                ),
                ...selectedFiles,
            ],
            notes: selectedNotes,
        })
        onClose()
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
        setNewTask({ ...newTask, dueDate: date })
        setShowCalendar(false)
    }

    const handleLabelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentLabel(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentLabel.trim()) {
            e.preventDefault()
            setNewTask({
                ...newTask,
                labels: [...newTask.labels, currentLabel.trim()],
            })
            setCurrentLabel('')
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <DialogHeader>
                    <DialogTitle>Add Task</DialogTitle>
                    <DialogDescription>
                        Create a new task for your project
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={newTask.title}
                            onChange={(e) =>
                                setNewTask({
                                    ...newTask,
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
                            value={newTask.description}
                            onChange={(e) =>
                                setNewTask({
                                    ...newTask,
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
                            value={newTask.assignee}
                            onChange={(e) =>
                                setNewTask({
                                    ...newTask,
                                    assignee: e.target.value,
                                })
                            }
                            placeholder="Enter assignee name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="labels">Labels</Label>
                        <div className="space-y-2">
                            <Input
                                id="labels"
                                value={currentLabel}
                                onChange={handleLabelsChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a label and press Enter"
                            />
                            {newTask.labels.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    {newTask.labels.map((label) => (
                                        <div
                                            key={label}
                                            className="flex items-center gap-1"
                                        >
                                            <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                                                {label}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setNewTask({
                                                        ...newTask,
                                                        labels: newTask.labels.filter(
                                                            (l) => l !== label
                                                        ),
                                                    })
                                                }}
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
                                    {newTask.dueDate ? (
                                        format(newTask.dueDate, 'PPP', {
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
                                    selected={newTask.dueDate}
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
                                            newTask.priority === priority
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() =>
                                            setNewTask({ ...newTask, priority })
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
                            {attachments.length > 0 && (
                                <div className="space-y-2">
                                    {attachments.map((attachment, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                        >
                                            <span className="text-sm">
                                                {typeof attachment === 'string'
                                                    ? attachment
                                                    : attachment.name}
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
                            {selectedExistingFiles.length > 0 && (
                                <div className="space-y-2">
                                    {selectedExistingFiles.map((fileId) => {
                                        const file = driveFiles.find(
                                            (f) => f.id === fileId
                                        )
                                        if (!file) return null
                                        return (
                                            <div
                                                key={fileId}
                                                className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={`https://drive-thirdparty.googleusercontent.com/16/type/${file.mimeType}`}
                                                        alt=""
                                                        className="h-5 w-5 object-contain"
                                                        onError={(e) => {
                                                            e.currentTarget.src =
                                                                'https://drive-thirdparty.googleusercontent.com/16/type/application/octet-stream'
                                                        }}
                                                    />
                                                    <span className="text-sm">
                                                        {file.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            window.open(
                                                                `https://drive.google.com/file/d/${file.id}/view`,
                                                                '_blank'
                                                            )
                                                        }
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemoveExistingFile(
                                                                fileId
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Select
                                    onValueChange={(value) => {
                                        if (
                                            !selectedExistingFiles.includes(
                                                value
                                            )
                                        ) {
                                            setSelectedExistingFiles([
                                                ...selectedExistingFiles,
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
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={`https://drive-thirdparty.googleusercontent.com/16/type/${file.mimeType}`}
                                                                alt=""
                                                                className="h-5 w-5 object-contain"
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.src =
                                                                        'https://drive-thirdparty.googleusercontent.com/16/type/application/octet-stream'
                                                                }}
                                                            />
                                                            <span className="font-medium">
                                                                {file.name}
                                                            </span>
                                                        </div>
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
                        <Button onClick={handleAddTask}>Add Task</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
