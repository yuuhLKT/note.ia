import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { useGoogleDriveConnection } from '@/hooks/use-google-drive-connection'
import { useNotesStore } from '@/store/notes'
import { Note } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    CheckCircle2,
    Cloud,
    Filter,
    Plus,
    RefreshCw,
    Trash2,
    Upload,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUploadModal } from './FileUploadModal'

function stripHtml(html: string) {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
}

interface FilterModalProps {
    isOpen: boolean
    onClose: () => void
    onApply: (filters: {
        title: string
        content: string
        startDate: string
        endDate: string
    }) => void
}

function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
    const [filters, setFilters] = useState({
        title: '',
        content: '',
        startDate: '',
        endDate: '',
    })

    const handleApply = () => {
        onApply(filters)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filter Notes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={filters.title}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    title: e.target.value,
                                })
                            }
                            placeholder="Filter by title"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Input
                            id="content"
                            value={filters.content}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    content: e.target.value,
                                })
                            }
                            placeholder="Filter by content"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        startDate: e.target.value,
                                    })
                                }
                            />
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) =>
                                    setFilters({
                                        ...filters,
                                        endDate: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleApply}>Apply Filters</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function HomePage() {
    const { isConnected, profile } = useGoogleDrive()
    const { login } = useGoogleDriveConnection()
    const navigate = useNavigate()
    const { notes, pendingSync, deleteNote } = useNotesStore()
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
    const [filters, setFilters] = useState({
        title: '',
        content: '',
        startDate: '',
        endDate: '',
    })

    const handleCreateNote = () => {
        navigate('/notes/editor')
    }

    const handleEditNote = (note: Note) => {
        navigate(`/notes/editor/${note.id}`)
    }

    const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation()
        deleteNote(noteId)
    }

    const handleApplyFilters = (newFilters: typeof filters) => {
        setFilters(newFilters)
    }

    const filteredNotes = notes.filter((note) => {
        const titleMatch = note.title
            .toLowerCase()
            .includes(filters.title.toLowerCase())
        const contentMatch = note.content
            .toLowerCase()
            .includes(filters.content.toLowerCase())
        const startDate = filters.startDate ? new Date(filters.startDate) : null
        const endDate = filters.endDate ? new Date(filters.endDate) : null
        const noteDate = new Date(note.createdAt)

        const dateMatch =
            (!startDate || noteDate >= startDate) &&
            (!endDate || noteDate <= endDate)

        return titleMatch && contentMatch && dateMatch
    })

    return (
        <div className="container py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Note.IA</h1>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to Note.IA</CardTitle>
                        <CardDescription>
                            Your personal workspace for notes, tasks, and files
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isConnected ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Connected as {profile?.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Your files and notes are being synced with
                                    Google Drive
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Connect your Google Drive account to start
                                    syncing your files and notes
                                </p>
                                <Button
                                    onClick={() => login()}
                                    className="w-full gap-2"
                                >
                                    <Cloud className="h-4 w-4" />
                                    Connect to Google Drive
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload Files</CardTitle>
                        <CardDescription>
                            Upload files to your Google Drive account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isConnected ? (
                            <FileUploadModal
                                trigger={
                                    <Button className="w-full gap-2">
                                        <Upload className="h-4 w-4" />
                                        Upload Files
                                    </Button>
                                }
                                onUploadComplete={() => {
                                    // Refresh the file list or show a success message
                                }}
                            />
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Connect to Google Drive to start uploading
                                    files
                                </p>
                                <Button
                                    onClick={() => login()}
                                    className="w-full gap-2"
                                >
                                    <Cloud className="h-4 w-4" />
                                    Connect to Google Drive
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">My Notes</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsFilterModalOpen(true)}
                            className="gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button onClick={handleCreateNote} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Note
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredNotes.map((note) => (
                        <Card
                            key={note.id}
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => handleEditNote(note)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg line-clamp-1">
                                        {note.title || 'Untitled Note'}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {pendingSync.has(note.id) && (
                                            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                            onClick={(e) =>
                                                handleDeleteNote(e, note.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {stripHtml(note.content)}
                                </p>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div>
                                        Created:{' '}
                                        {format(
                                            new Date(note.createdAt),
                                            'PPP',
                                            { locale: ptBR }
                                        )}
                                    </div>
                                    {note.updatedAt !== note.createdAt && (
                                        <div>
                                            Updated:{' '}
                                            {format(
                                                new Date(note.updatedAt),
                                                'PPP',
                                                { locale: ptBR }
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={handleApplyFilters}
            />
        </div>
    )
}
