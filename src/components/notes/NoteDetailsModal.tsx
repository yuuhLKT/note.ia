import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useKanbanStore } from '@/store/kanban'
import { useNotesStore } from '@/store/notes'
import { format } from 'date-fns'
import { FileText, Plus, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { FileUploadModal } from '../files/FileUploadModal'
import { TaskDetailsDialog } from './TaskDetailsDialog'

interface NoteDetailsModalProps {
    noteId: string
    isOpen: boolean
    onClose: () => void
}

export function NoteDetailsModal({
    noteId,
    isOpen,
    onClose,
}: NoteDetailsModalProps) {
    const { notes, updateNote } = useNotesStore()
    const { tasks } = useKanbanStore()
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState('')
    const [newLink, setNewLink] = useState('')

    const note = notes.find((n) => n.id === noteId)
    if (!note) return null

    const associatedTasks = tasks.filter((task) => task.notes?.includes(noteId))
    const associatedFiles = note.files || []

    const handleAddLink = () => {
        if (newLink.trim()) {
            const links = [...(note.links || []), newLink.trim()]
            updateNote(noteId, { links })
            setNewLink('')
        }
    }

    const handleRemoveLink = (link: string) => {
        const links = (note.links || []).filter((l) => l !== link)
        updateNote(noteId, { links })
    }

    const handleAddFiles = (files: File[]) => {
        const newFiles = files.map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
        }))
        const updatedFiles = [...(note.files || []), ...newFiles]
        updateNote(noteId, { files: updatedFiles })
    }

    const handleRemoveFile = (fileId: string) => {
        const files = (note.files || []).filter((f) => f.id !== fileId)
        updateNote(noteId, { files })
    }

    const handleAddExistingFile = (fileId: string) => {
        const sourceNote = notes.find((n) =>
            n.files?.some((f) => f.id === fileId)
        )
        if (sourceNote) {
            const file = sourceNote.files?.find((f) => f.id === fileId)
            if (file) {
                const files = [...(note.files || []), file]
                updateNote(noteId, { files })
            }
        }
        setSelectedFile('')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Note Details</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                    <div className="space-y-6">
                        <Card className="p-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Created at</span>
                                </div>
                                <p className="text-sm">
                                    {format(new Date(note.createdAt), 'PPP p')}
                                </p>
                                {note.updatedAt > note.createdAt && (
                                    <>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>Updated at</span>
                                        </div>
                                        <p className="text-sm">
                                            {format(
                                                new Date(note.updatedAt),
                                                'PPP p'
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-semibold mb-4">
                                Associated Tasks
                            </h3>
                            {associatedTasks.length > 0 ? (
                                <div className="space-y-2">
                                    {associatedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between p-2 bg-muted/50 rounded cursor-pointer hover:bg-muted"
                                            onClick={() =>
                                                setSelectedTaskId(task.id)
                                            }
                                        >
                                            <span className="text-sm">
                                                {task.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No tasks associated
                                </p>
                            )}
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-semibold mb-4">Links</h3>
                            <div className="space-y-2">
                                {note.links?.map((link) => (
                                    <div
                                        key={link}
                                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                    >
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {link}
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRemoveLink(link)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <Input
                                        value={newLink}
                                        onChange={(e) =>
                                            setNewLink(e.target.value)
                                        }
                                        placeholder="Add a link"
                                        className="flex-1"
                                    />
                                    <Button size="sm" onClick={handleAddLink}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-semibold mb-4">Files</h3>
                            <div className="space-y-2">
                                {associatedFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span className="text-sm">
                                                {file.name}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRemoveFile(file.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}

                                <div className="flex gap-2">
                                    <FileUploadModal
                                        trigger={
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload Files
                                            </Button>
                                        }
                                        onUploadComplete={handleAddFiles}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Select
                                        value={selectedFile}
                                        onValueChange={handleAddExistingFile}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select existing file" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {notes
                                                .filter((n) => n.id !== noteId)
                                                .map((n) =>
                                                    n.files?.map((file) => (
                                                        <SelectItem
                                                            key={file.id}
                                                            value={file.id}
                                                        >
                                                            {file.name} (from{' '}
                                                            {n.title})
                                                        </SelectItem>
                                                    ))
                                                )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>
                    </div>
                </ScrollArea>
            </DialogContent>

            {selectedTaskId && (
                <TaskDetailsDialog
                    taskId={selectedTaskId}
                    isOpen={!!selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </Dialog>
    )
}
