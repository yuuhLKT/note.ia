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
import { Textarea } from '@/components/ui/textarea'
import { useNotesStore } from '@/store/notes'
import type { Note } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, Plus, RefreshCw, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { NoteDetailsModal } from './NoteDetailsModal'

function stripHtml(html: string) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
}

function formatDate(dateString: string) {
    try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) {
            return 'Invalid date'
        }
        return format(date, "MMM d, yyyy 'at' h:mm a", {
            locale: ptBR,
        })
    } catch (error) {
        console.error('Error formatting date:', error)
        return 'Invalid date'
    }
}

export function NotesList() {
    const navigate = useNavigate()
    const { notes, deleteNote, addNote, loadNotes, pendingSync } =
        useNotesStore()
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedNote, setSelectedNote] = useState<Note | null>(null)
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        async function load() {
            setIsLoading(true)
            try {
                await loadNotes()
            } catch (error) {
                console.error('Error loading notes:', error)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [loadNotes])

    useEffect(() => {
        // Atualiza a lista de notas quando houver mudanças
    }, [notes])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleFileDrop,
        accept: {
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                ['.docx'],
        },
        noClick: true,
    })

    async function handleFileDrop(acceptedFiles: File[]) {
        setIsProcessing(true)
        try {
            for (const file of acceptedFiles) {
                const content = await file.text()
                await addNote({
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    content: content,
                })
            }
        } catch (error) {
            console.error('Error processing files:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleEditNote = (note: Note) => {
        navigate(`/notes/editor/${note.id}`)
    }

    return (
        <div className="space-y-4" {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Notes</h1>
                <Button onClick={() => navigate('/notes/editor')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Note
                </Button>
            </div>
            <div
                className={`
                grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative
                ${isDragActive ? 'pointer-events-none' : ''}
            `}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-sm text-muted-foreground">
                                Loading notes...
                            </p>
                        </div>
                    </div>
                )}
                {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                Processing files...
                            </p>
                        </div>
                    </div>
                )}
                {isDragActive && (
                    <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
                        <div className="text-center">
                            <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                            <p className="text-lg font-medium text-primary">
                                Drop files to create notes
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Supported formats: .txt, .md, .doc, .docx
                            </p>
                        </div>
                    </div>
                )}
                {notes.map((note) => (
                    <div
                        key={note.id}
                        className="bg-card rounded-lg border p-4 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => handleEditNote(note)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg">
                                    {note.title || 'Untitled Note'}
                                </h3>
                                {pendingSync.has(note.id) && (
                                    <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNote(note.id)
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {stripHtml(note.content)}
                        </p>
                        <div className="text-xs text-muted-foreground">
                            <p>Created: {formatDate(note.createdAt)}</p>
                            {note.updatedAt !== note.createdAt && (
                                <p>Updated: {formatDate(note.updatedAt)}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New Note</DialogTitle>
                        <DialogDescription>
                            Add a new note to your notebook
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={newNote.title}
                                onChange={(e) =>
                                    setNewNote({
                                        ...newNote,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Enter note title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={newNote.content}
                                onChange={(e) =>
                                    setNewNote({
                                        ...newNote,
                                        content: e.target.value,
                                    })
                                }
                                placeholder="Enter note content"
                                className="min-h-[200px]"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={() => navigate('/notes/new')}>
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Note</DialogTitle>
                        <DialogDescription>
                            Edit your note content
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={newNote.title}
                                onChange={(e) =>
                                    setNewNote({
                                        ...newNote,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Enter note title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-content">Content</Label>
                            <Textarea
                                id="edit-content"
                                value={newNote.content}
                                onChange={(e) =>
                                    setNewNote({
                                        ...newNote,
                                        content: e.target.value,
                                    })
                                }
                                placeholder="Enter note content"
                                className="min-h-[200px]"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() =>
                                    navigate(`/notes/${selectedNote?.id}`)
                                }
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {selectedNote && (
                <NoteDetailsModal
                    noteId={selectedNote.id}
                    isOpen={true}
                    onClose={() => {
                        setSelectedNote(null)
                        navigate('/notes')
                    }}
                />
            )}
        </div>
    )
}
