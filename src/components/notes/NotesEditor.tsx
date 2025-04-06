import { Button } from '@/components/ui/button'
import { useNotesStore } from '@/store/notes'
import { ArrowLeft, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NoteDetailsModal } from './NoteDetailsModal'
import { RichTextEditor } from './RichTextEditor'

export function NotesEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { notes, addNote, updateNote } = useNotesStore()
    const [showDetails, setShowDetails] = useState(false)

    const note = id ? notes.find((n) => n.id === id) : null
    const [title, setTitle] = useState(note?.title || '')
    const [content, setContent] = useState(note?.content || '')

    useEffect(() => {
        if (note) {
            setTitle(note.title)
            setContent(note.content)
        }
    }, [note])

    const handleSave = () => {
        if (id) {
            updateNote(id, {
                title,
                content,
                files: note?.files || [],
                links: note?.links || [],
            })
        } else {
            addNote({ title, content })
        }
        navigate('/')
    }

    return (
        <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Button>
                <div className="flex items-center gap-2">
                    {id && (
                        <Button
                            variant="outline"
                            onClick={() => setShowDetails(true)}
                        >
                            <Info className="mr-2 h-4 w-4" />
                            Details
                        </Button>
                    )}
                    <Button onClick={handleSave}>Save Note</Button>
                </div>
            </div>
            <div className="space-y-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title"
                    className="w-full text-2xl font-semibold bg-transparent border-none focus:outline-none"
                />
                <RichTextEditor content={content} onChange={setContent} />
            </div>
            {id && (
                <NoteDetailsModal
                    noteId={id}
                    isOpen={showDetails}
                    onClose={() => setShowDetails(false)}
                />
            )}
        </div>
    )
}
