import { ThemeProvider } from '@/components/ui/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { getGoogleDriveCredentials } from '@/services/googleDrive'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FilesPage } from './components/files/FilesPage'
import { HomePage } from './components/files/HomePage'
import { KanbanPage } from './components/kanban/KanbanPage'
import { Layout } from './components/layout/Layout'
import { NotesEditor } from './components/notes/NotesEditor'
import { SettingsPage } from './pages/settings'

export function App() {
    const { clientId } = getGoogleDriveCredentials()

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/files" element={<FilesPage />} />
                            <Route path="/kanban" element={<KanbanPage />} />
                            <Route
                                path="/settings"
                                element={<SettingsPage />}
                            />
                            <Route
                                path="/notes/editor"
                                element={<NotesEditor />}
                            />
                            <Route
                                path="/notes/editor/:id"
                                element={<NotesEditor />}
                            />
                        </Route>
                    </Routes>
                    <Toaster />
                </BrowserRouter>
            </ThemeProvider>
        </GoogleOAuthProvider>
    )
}
