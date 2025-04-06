import { FileText, Upload } from 'lucide-react'
import { DriveUpload } from '../files/DriveUpload'
import { NotesList } from './NotesList'

export function NotesPage() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        <div className="flex items-center gap-2">
                            <FileText className="h-6 w-6" />
                            My Notes
                        </div>
                    </h2>
                </div>
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <NotesList />
                </div>
            </section>
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        <div className="flex items-center gap-2">
                            <Upload className="h-6 w-6" />
                            Upload Files
                        </div>
                    </h2>
                </div>
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <DriveUpload onUploadComplete={() => {}} />
                </div>
            </section>
        </div>
    )
}
