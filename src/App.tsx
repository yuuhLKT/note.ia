import { DriveUpload } from '@/components/files/DriveUpload'
import { FileExplorer } from '@/components/files/FileExplorer'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Header } from '@/components/layout/Header'
import { NotesList } from '@/components/notes/NotesList'
import { NotesPage } from '@/components/notes/NotesPage'
import { FileText, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
    const [activeTab, setActiveTab] = useState('notes')

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1)
            if (hash === 'notes' || hash === 'kanban' || hash === 'files') {
                setActiveTab(hash)
            }
        }

        handleHashChange()
        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [])

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <div className="min-h-screen bg-background">
                                <Header />
                                <main className="container mx-auto px-4 py-8 max-w-7xl">
                                    {activeTab === 'notes' && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            <section className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-2xl font-semibold tracking-tight">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-6 w-6" />
                                                            Notes
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
                                                    <DriveUpload />
                                                </div>
                                            </section>
                                        </div>
                                    )}
                                    {activeTab === 'kanban' && <KanbanBoard />}
                                    {activeTab === 'files' && <FileExplorer />}
                                </main>
                            </div>
                        }
                    />
                    <Route path="/notes/new" element={<NotesPage />} />
                    <Route path="/notes/:id" element={<NotesPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App
