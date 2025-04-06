import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNotesStore } from '@/store/notes'
import { ArrowLeft, Info, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NoteSidebar } from './NoteSidebar'
import { RichTextEditor } from './RichTextEditor'

interface Note {
    id: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
    links?: string[]
    files?: Array<{
        id: string
        name: string
        type: string
        size: number
        url: string
    }>
}

export function NotesPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { notes, addNote, updateNote } = useNotesStore()
    const [note, setNote] = useState<Note | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [showSidebar, setShowSidebar] = useState(false)

    useEffect(() => {
        if (id) {
            const existingNote = notes.find((note) => note.id === id)
            if (existingNote) {
                setNote(existingNote)
                setTitle(existingNote.title)
                setContent(existingNote.content)
            }
        } else {
            setNote(null)
            setTitle('')
            setContent('')
        }
    }, [id, notes])

    const handleSave = () => {
        if (title.trim() && content.trim()) {
            if (note) {
                updateNote(note.id, {
                    title,
                    content,
                    updatedAt: new Date(),
                })
            } else {
                addNote({
                    title,
                    content,
                })
            }
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="flex items-center gap-2"
                        >
                            <Info className="h-4 w-4" />
                            Details
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            Save Note
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter note title"
                            className="text-3xl font-bold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                        />
                    </div>
                    <div className="space-y-2">
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                            placeholder="Start writing your note..."
                        />
                    </div>
                </div>
            </div>

            {showSidebar && note && (
                <NoteSidebar
                    noteId={note.id}
                    onClose={() => setShowSidebar(false)}
                />
            )}
        </div>
    )
}
