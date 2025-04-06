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
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { useToast } from '@/hooks/use-toast'
import { useKanbanStore } from '@/store/kanban'
import { useNotesStore } from '@/store/notes'
import { format } from 'date-fns'
import { ExternalLink, Plus, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
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
    const { uploadFile } = useGoogleDrive()
    const { toast } = useToast()
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState('')
    const [newLink, setNewLink] = useState('')
    const [isUploading, setIsUploading] = useState(false)

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

    const handleFileUpload = async (files: File[]) => {
        try {
            setIsUploading(true)
            const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    const response = await uploadFile(file)
                    return {
                        id: response.id,
                        name: response.name,
                        mimeType: response.mimeType,
                        webViewLink: response.webViewLink,
                        iconLink: response.iconLink,
                    }
                })
            )
            const updatedFiles = [...note.files, ...uploadedFiles]
            updateNote(noteId, { files: updatedFiles })
            toast({
                title: 'Success',
                description: 'Files uploaded successfully',
            })
        } catch (e) {
            console.error(e)
            toast({
                title: 'Error',
                description: 'Failed to upload files',
                variant: 'destructive',
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemoveFile = (fileId: string) => {
        const files = note.files.filter((f) => f.id !== fileId)
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
                                            <img
                                                src={file.iconLink}
                                                alt={file.name}
                                                className="h-4 w-4"
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
                                                        file.webViewLink,
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
                                                    handleRemoveFile(file.id)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

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
                                        disabled={isUploading}
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        {isUploading
                                            ? 'Uploading...'
                                            : 'Upload Files'}
                                    </Button>
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
