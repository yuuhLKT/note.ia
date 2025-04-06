import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { useGoogleDriveConnection } from '@/hooks/use-google-drive-connection'
import { Upload } from 'lucide-react'

interface DriveUploadProps {
    isOpen: boolean
    onClose: () => void
    onUpload: (file: File) => void
}

export function DriveUpload({ isOpen, onClose, onUpload }: DriveUploadProps) {
    const { isConnected, profile } = useGoogleDrive()
    const { login } = useGoogleDriveConnection()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload to Google Drive</DialogTitle>
                    <DialogDescription>
                        {isConnected
                            ? `Connected as ${profile?.name}`
                            : 'Connect to your Google Drive account to upload files'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {!isConnected ? (
                        <Button onClick={() => login()} className="w-full">
                            Connect to Google Drive
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="file">Select File</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            onUpload(file)
                                            onClose()
                                        }
                                    }}
                                />
                            </div>
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-8">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Upload className="h-8 w-8 text-gray-400" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Drag and drop your files here
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
