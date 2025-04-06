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
import { formatDriveFile } from '@/lib/google-drive'
import { GoogleDriveFile, listFiles, uploadFile } from '@/services/googleDrive'
import { useKanbanStore } from '@/store/kanban'
import { useNotesStore } from '@/store/notes'
import console from 'console'
import { format } from 'date-fns'
import { ExternalLink, Plus, Trash2, Upload } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
    const { isConnected } = useGoogleDrive()
    const { toast } = useToast()
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState('')
    const [newLink, setNewLink] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [availableFiles, setAvailableFiles] = useState<GoogleDriveFile[]>([])

    const note = notes.find((n) => n.id === noteId)
    const associatedTasks = tasks.filter((task) => task.notes?.includes(noteId))
    const associatedFiles = useMemo(() => note?.files || [], [note?.files])

    // Load available files from Google Drive
    useEffect(() => {
        const loadFiles = async () => {
            if (!isConnected) return

            try {
                const files = await listFiles()
                // Filter out files already in the current note
                const currentFileIds = new Set(associatedFiles.map((f) => f.id))
                const filteredFiles = files.filter(
                    (file: GoogleDriveFile) => !currentFileIds.has(file.id)
                )
                setAvailableFiles(filteredFiles)
            } catch (error) {
                console.error('Error loading files:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to load files from Google Drive',
                    variant: 'destructive',
                })
            }
        }

        loadFiles()
    }, [isConnected, associatedFiles, toast])

    if (!note) return null

    const handleAddLink = () => {
        if (newLink.trim()) {
            let formattedLink = newLink.trim()

            if (
                !formattedLink.startsWith('http://') &&
                !formattedLink.startsWith('https://')
            ) {
                formattedLink = 'http://' + formattedLink
            }

            try {
                // Validate URL
                new URL(formattedLink)
                const links = [...(note.links || []), formattedLink]
                updateNote(noteId, { links })
                setNewLink('')
            } catch (e) {
                console.error(e)
                toast({
                    title: 'Invalid URL',
                    description: 'Please enter a valid URL',
                    variant: 'destructive',
                })
            }
        }
    }

    const handleRemoveLink = (link: string) => {
        const links = (note.links || []).filter((l) => l !== link)
        updateNote(noteId, { links })
    }

    const handleFileUpload = async (files: File[]) => {
        if (!isConnected) {
            toast({
                title: 'Error',
                description: 'Please connect to Google Drive first',
                variant: 'destructive',
            })
            return
        }

        try {
            setIsUploading(true)
            const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    const response = await uploadFile(file)
                    return formatDriveFile({
                        id: response.id,
                        name: response.name,
                        mimeType: response.mimeType,
                        modifiedTime: new Date().toISOString(),
                        size: file.size.toString(),
                    })
                })
            )
            const updatedFiles = [...(note.files || []), ...uploadedFiles]
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
        const file = availableFiles.find((f) => f.id === fileId)
        if (file) {
            const files = [...(note.files || []), file]
            updateNote(noteId, { files })
            toast({
                title: 'Success',
                description: 'File added successfully',
            })
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
                            <div className="space-y-4">
                                {associatedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        {associatedFiles.map((file) => (
                                            <div
                                                key={file.id}
                                                className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {file.iconLink ? (
                                                        <img
                                                            src={file.iconLink}
                                                            alt=""
                                                            className="h-5 w-5 object-contain"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    'https://drive-thirdparty.googleusercontent.com/16/type/application/octet-stream'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="h-5 w-5 bg-muted-foreground/20 rounded flex items-center justify-center">
                                                            <Upload className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium">
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
                                                            handleRemoveFile(
                                                                file.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    handleFileUpload(
                                                        Array.from(
                                                            e.target.files
                                                        )
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
                                                    .getElementById(
                                                        'file-upload'
                                                    )
                                                    ?.click()
                                            }
                                            disabled={
                                                isUploading || !isConnected
                                            }
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            {isUploading
                                                ? 'Uploading...'
                                                : !isConnected
                                                  ? 'Connect to Google Drive first'
                                                  : 'Upload Files'}
                                        </Button>
                                    </div>

                                    {/* Select de arquivos existentes */}
                                    <div className="flex gap-2">
                                        <Select
                                            value={selectedFile}
                                            onValueChange={
                                                handleAddExistingFile
                                            }
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Add existing file" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableFiles.length > 0 ? (
                                                    availableFiles.map(
                                                        (file) => (
                                                            <SelectItem
                                                                key={file.id}
                                                                value={file.id}
                                                                className="cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {file.iconLink ? (
                                                                        <img
                                                                            src={
                                                                                file.iconLink
                                                                            }
                                                                            alt=""
                                                                            className="h-5 w-5 object-contain"
                                                                            onError={(
                                                                                e
                                                                            ) => {
                                                                                e.currentTarget.src =
                                                                                    'https://drive-thirdparty.googleusercontent.com/16/type/application/octet-stream'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="h-5 w-5 bg-muted-foreground/20 rounded flex items-center justify-center">
                                                                            <Upload className="h-3 w-3" />
                                                                        </div>
                                                                    )}
                                                                    <span className="font-medium">
                                                                        {
                                                                            file.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    )
                                                ) : (
                                                    <div className="p-2 text-sm text-muted-foreground">
                                                        No files available from
                                                        Google Drive
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
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
