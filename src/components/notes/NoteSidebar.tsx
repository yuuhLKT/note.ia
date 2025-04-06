import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { ptBR } from 'date-fns/locale'
import { Calendar, FileText, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { TaskDetailsDialog } from './TaskDetailsDialog'

interface NoteSidebarProps {
    noteId: string
    onClose: () => void
}

export function NoteSidebar({ noteId, onClose }: NoteSidebarProps) {
    const { notes, updateNote } = useNotesStore()
    const { tasks } = useKanbanStore()
    const [newLink, setNewLink] = useState('')
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState('')

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

    const handleAddFile = (file: File) => {
        const files = [
            ...(note.files || []),
            {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file),
            },
        ]
        updateNote(noteId, { files })
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
        <div className="w-80 fixed right-0 top-0 h-screen bg-background border-l p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Note Details</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-8rem)]">
                <div className="space-y-6">
                    <Card className="p-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Created at</span>
                            </div>
                            <p className="text-sm">
                                {format(
                                    note.createdAt,
                                    "MM/dd/yyyy 'at' HH:mm",
                                    { locale: ptBR }
                                )}
                            </p>
                            {note.updatedAt > note.createdAt && (
                                <>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Updated at</span>
                                    </div>
                                    <p className="text-sm">
                                        {format(
                                            note.updatedAt,
                                            "MM/dd/yyyy 'at' HH:mm",
                                            { locale: ptBR }
                                        )}
                                    </p>
                                </>
                            )}
                        </div>
                    </Card>

                    <Card className="p-4">
                        <h3 className="font-semibold mb-4">Associated Tasks</h3>
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
                                        onClick={() => handleRemoveLink(link)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Input
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
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

            {selectedTaskId && (
                <TaskDetailsDialog
                    taskId={selectedTaskId}
                    isOpen={!!selectedTaskId}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </div>
    )
}
