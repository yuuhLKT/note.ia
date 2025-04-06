import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { LogOut, Settings } from 'lucide-react'

export function GoogleDriveSettings() {
    const { isConnected, logout, account } = useGoogleDrive()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Google Drive Settings</CardTitle>
                <CardDescription>
                    Manage your Google Drive connection
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isConnected ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={account?.picture}
                                alt={account?.name}
                                className="h-12 w-12 rounded-full"
                            />
                            <div>
                                <p className="font-medium">{account?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {account?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={logout}
                            className="w-full"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Disconnect Google Drive
                        </Button>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Connect to Google Drive to enable file uploads
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
