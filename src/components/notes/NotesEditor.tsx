import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import type { Note } from '@/types'

interface NotesEditorProps {
    initialNote?: Note
    onSave?: (note: Omit<Note, 'id'>) => void
}

export function NotesEditor({ initialNote, onSave }: NotesEditorProps) {
    const [content, setContent] = useState(initialNote?.content ?? '')

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value)
        onSave?.({
            content: e.target.value,
            lastEdited: new Date(),
        })
    }

    return (
        <Card className="flex flex-col h-full">
            <Textarea
                className="flex-1 resize-none border-0 focus-visible:ring-0"
                placeholder="Write your notes here..."
                value={content}
                onChange={handleChange}
            />
        </Card>
    )
}
