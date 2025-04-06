import { FileExplorer } from '@/components/files/FileExplorer'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Header } from '@/components/layout/Header'
import { NotesEditor } from '@/components/notes/NotesEditor'
import { NotesPage } from '@/components/notes/NotesPage'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { SettingsPage } from '@/pages/settings'
import { getGoogleDriveCredentials } from '@/services/googleDrive'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function App() {
    const { clientId } = getGoogleDriveCredentials()

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <BrowserRouter>
                    <div className="min-h-screen bg-background">
                        <Header />
                        <main className="container mx-auto py-6">
                            <Routes>
                                <Route
                                    path="/"
                                    element={<Navigate to="/notes" replace />}
                                />
                                <Route path="/notes" element={<NotesPage />} />
                                <Route
                                    path="/notes/editor"
                                    element={<NotesEditor />}
                                />
                                <Route
                                    path="/notes/editor/:id"
                                    element={<NotesEditor />}
                                />
                                <Route
                                    path="/kanban"
                                    element={<KanbanBoard />}
                                />
                                <Route
                                    path="/files"
                                    element={<FileExplorer />}
                                />
                                <Route
                                    path="/settings"
                                    element={<SettingsPage />}
                                />
                            </Routes>
                        </main>
                    </div>
                    <Toaster />
                </BrowserRouter>
            </ThemeProvider>
        </GoogleOAuthProvider>
    )
}

export default App
