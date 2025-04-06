import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/use-theme'
import { BrainCircuit, Moon, Settings, Sun } from 'lucide-react'

export function Header() {
    const { setTheme } = useTheme()

    const handleLogoClick = () => {
        window.location.hash = 'notes'
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4">
                <div
                    className="flex items-center gap-2 mr-8 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleLogoClick}
                >
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    <span className="text-xl font-semibold tracking-tight">
                        Note.IA
                    </span>
                </div>

                <nav className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        className="relative px-4 h-9 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-medium"
                        onClick={() => (window.location.hash = 'notes')}
                        data-active={
                            window.location.hash === '#notes' ||
                            window.location.hash === ''
                        }
                    >
                        Notes & Files
                    </Button>
                    <Button
                        variant="ghost"
                        className="relative px-4 h-9 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-medium"
                        onClick={() => (window.location.hash = 'kanban')}
                        data-active={window.location.hash === '#kanban'}
                    >
                        Kanban Board
                    </Button>
                    <Button
                        variant="ghost"
                        className="relative px-4 h-9 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[active=true]:font-medium"
                        onClick={() => (window.location.hash = 'files')}
                        data-active={window.location.hash === '#files'}
                    >
                        All Files
                    </Button>
                </nav>

                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 hover:bg-accent"
                            >
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme('light')}>
                                Light
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('dark')}>
                                Dark
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 hover:bg-accent"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Open settings</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Settings</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="text-sm text-muted-foreground">
                                    Settings will be available soon.
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </header>
    )
}
