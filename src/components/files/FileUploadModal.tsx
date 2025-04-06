import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { useGoogleDriveConnection } from '@/hooks/use-google-drive-connection'
import { uploadFile } from '@/services/googleDrive'
import { Upload } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadModalProps {
    trigger: ReactNode
    onUploadComplete: () => void
}

export function FileUploadModal({
    trigger,
    onUploadComplete,
}: FileUploadModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const { isConnected } = useGoogleDrive()
    const { login } = useGoogleDriveConnection()

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleFileDrop,
        disabled: !isConnected || isUploading,
    })

    async function handleFileDrop(acceptedFiles: File[]) {
        if (!isConnected) {
            setUploadError('Please connect to Google Drive first')
            return
        }

        setIsUploading(true)
        setUploadError(null)

        try {
            for (const file of acceptedFiles) {
                await uploadFile(file)
            }
            onUploadComplete()
            setIsOpen(false)
        } catch (error) {
            console.error('Error uploading file:', error)
            setUploadError(
                error instanceof Error
                    ? error.message
                    : 'An error occurred while uploading the file'
            )
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                        {isConnected
                            ? 'Drag and drop files here or click to select files'
                            : 'Connect to your Google Drive account to upload files'}
                    </DialogDescription>
                </DialogHeader>

                {!isConnected ? (
                    <Button onClick={() => login()} className="w-full">
                        Connect to Google Drive
                    </Button>
                ) : (
                    <div
                        {...getRootProps()}
                        className={`
                            flex flex-col items-center justify-center rounded-lg
                            border-2 border-dashed p-8 transition-colors
                            ${
                                isDragActive
                                    ? 'border-primary bg-primary/10'
                                    : 'border-muted-foreground/25'
                            }
                            ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        <input {...getInputProps()} />
                        <Upload className="h-8 w-8 text-muted-foreground mb-4" />
                        <div className="text-center space-y-2">
                            {isUploading ? (
                                <p>Uploading...</p>
                            ) : (
                                <>
                                    <p>
                                        <span className="font-medium">
                                            Click to upload
                                        </span>{' '}
                                        or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Any file type supported by Google Drive
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {uploadError && (
                    <p className="text-sm text-destructive text-center mt-2">
                        {uploadError}
                    </p>
                )}

                <div className="flex justify-end gap-4 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
