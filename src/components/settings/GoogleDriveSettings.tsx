import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { useGoogleDriveConnection } from '@/hooks/use-google-drive-connection'
import { useKanbanStore } from '@/store/kanban'
import { useNotesStore } from '@/store/notes'
import { LogOut, Upload, User } from 'lucide-react'
import { useEffect, useState } from 'react'

const SYNC_INTERVALS = [
    { value: '30', label: '30 seconds' },
    { value: '60', label: '1 minute' },
    { value: '180', label: '3 minutes' },
    { value: '300', label: '5 minutes' },
]

export function GoogleDriveSettings() {
    const { isConnected, logout, profile } = useGoogleDrive()
    const { login } = useGoogleDriveConnection()
    const [syncInterval, setSyncInterval] = useState(() => {
        const saved = localStorage.getItem('syncInterval')
        return saved || '60'
    })
    const { syncWithDrive: syncNotes } = useNotesStore()
    const { syncWithDrive: syncTasks } = useKanbanStore()

    useEffect(() => {
        localStorage.setItem('syncInterval', syncInterval)
    }, [syncInterval])

    useEffect(() => {
        if (!isConnected) return

        const interval = setInterval(
            () => {
                syncNotes()
                syncTasks()
            },
            parseInt(syncInterval) * 1000
        )

        return () => clearInterval(interval)
    }, [isConnected, syncInterval, syncNotes, syncTasks])

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Google Drive</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isConnected ? (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                            <p className="text-sm text-muted-foreground mb-4">
                                Connect to Google Drive to sync your notes and
                                tasks
                            </p>
                            <Button onClick={() => login()} className="w-full">
                                <Upload className="mr-2 h-4 w-4" />
                                Connect to Google Drive
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    {profile?.picture ? (
                                        <img
                                            src={profile.picture}
                                            alt={profile.name}
                                            className="h-10 w-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">
                                            {profile?.name || 'Google Account'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {profile?.email}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={logout}
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {isConnected && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sync Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Auto-sync Interval
                            </label>
                            <Select
                                value={syncInterval}
                                onValueChange={setSyncInterval}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select sync interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SYNC_INTERVALS.map((interval) => (
                                        <SelectItem
                                            key={interval.value}
                                            value={interval.value}
                                        >
                                            {interval.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Your notes and tasks will automatically sync
                                with Google Drive every {syncInterval} seconds
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
