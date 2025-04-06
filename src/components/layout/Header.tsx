import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ui/theme-provider'
import { useSyncDrive } from '@/hooks/use-sync-drive'
import { useToast } from '@/hooks/use-toast'
import {
    FileText,
    Home,
    Kanban,
    Loader2,
    RefreshCw,
    Settings,
    Upload,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Header() {
    const { pathname } = useLocation()
    const { theme, setTheme } = useTheme()
    const { sync } = useSyncDrive()
    const { toast } = useToast()
    const [isSyncing, setIsSyncing] = useState(false)

    const handleSync = async () => {
        try {
            setIsSyncing(true)
            await sync()
            toast({
                title: 'Success',
                description: 'Data synchronized successfully',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Failed to sync data',
                variant: 'destructive',
            })
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4">
                <div className="flex items-center gap-2 mr-8">
                    <Link to="/" className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        <span className="text-xl font-semibold tracking-tight">
                            Note.IA
                        </span>
                    </Link>
                </div>

                <nav className="flex items-center gap-4">
                    <Link to="/">
                        <Button
                            variant={pathname === '/' ? 'default' : 'ghost'}
                            className="flex items-center gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Home
                        </Button>
                    </Link>
                    <Link to="/kanban">
                        <Button
                            variant={
                                pathname === '/kanban' ? 'default' : 'ghost'
                            }
                            className="flex items-center gap-2"
                        >
                            <Kanban className="h-4 w-4" />
                            Tasks
                        </Button>
                    </Link>
                    <Link to="/files">
                        <Button
                            variant={
                                pathname === '/files' ? 'default' : 'ghost'
                            }
                            className="flex items-center gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Files
                        </Button>
                    </Link>
                </nav>

                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="relative"
                    >
                        {isSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        <span className="sr-only">Sync</span>
                    </Button>
                    <Link to="/settings">
                        <Button
                            variant="outline"
                            size="icon"
                            className={
                                pathname === '/settings' ? 'bg-primary/10' : ''
                            }
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setTheme(theme === 'dark' ? 'light' : 'dark')
                        }
                    >
                        {theme === 'dark' ? '🌞' : '🌙'}
                    </Button>
                </div>
            </div>
        </header>
    )
}
