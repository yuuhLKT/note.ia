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
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Note {
    id: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
}

function stripHtml(html: string) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
}

export function NotesList() {
    const navigate = useNavigate()
    const { notes, deleteNote } = useNotesStore()
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [selectedNote] = useState<Note | null>(null)
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
    })

    const handleNewNote = () => {
        navigate('/notes/editor')
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleNewNote}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Note
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                    <div
                        key={note.id}
                        className="bg-card rounded-lg border p-4 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => navigate(`/notes/editor/${note.id}`)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">
                                {note.title || 'Untitled Note'}
                            </h3>
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
                            <p>
                                Created:{' '}
                                {format(
                                    note.createdAt,
                                    "MMM d, yyyy 'at' h:mm a",
                                    {
                                        locale: ptBR,
                                    }
                                )}
                            </p>
                            {note.updatedAt > note.createdAt && (
                                <p>
                                    Updated:{' '}
                                    {format(
                                        note.updatedAt,
                                        "MMM d, yyyy 'at' h:mm a",
                                        {
                                            locale: ptBR,
                                        }
                                    )}
                                </p>
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
        </div>
    )
}
