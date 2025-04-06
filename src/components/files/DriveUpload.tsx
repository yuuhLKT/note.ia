import { Button } from '@/components/ui/button'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { useToast } from '@/hooks/use-toast'
import { uploadFile } from '@/services/googleDrive'
import { Upload } from 'lucide-react'
import { useState } from 'react'

interface DriveUploadProps {
    onUploadComplete: (file: any) => void
}

export function DriveUpload({ onUploadComplete }: DriveUploadProps) {
    const { toast } = useToast()
    const { isConnected, login, account } = useGoogleDrive()
    const [isUploading, setIsUploading] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])

    const handleConnect = () => {
        login()
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        setSelectedFiles(files)
    }

    const handleUpload = async () => {
        if (!isConnected) {
            toast({
                title: 'Error',
                description: 'Please connect to Google Drive first',
                variant: 'destructive',
            })
            return
        }

        if (selectedFiles.length === 0) {
            toast({
                title: 'Error',
                description: 'Please select at least one file',
                variant: 'destructive',
            })
            return
        }

        setIsUploading(true)

        try {
            for (const file of selectedFiles) {
                const uploadedFile = await uploadFile(file)
                onUploadComplete(uploadedFile)
            }

            toast({
                title: 'Success',
                description: 'Files uploaded successfully',
            })

            setSelectedFiles([])
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to upload files',
                variant: 'destructive',
            })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-4">
            {!isConnected ? (
                <Button onClick={handleConnect} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Connect to Google Drive
                </Button>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img
                                src={account?.picture}
                                alt={account?.name}
                                className="h-8 w-8 rounded-full"
                            />
                            <div>
                                <p className="font-medium">{account?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {account?.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
                        >
                            <div className="text-center">
                                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Click to select files or drag and drop
                                </p>
                            </div>
                        </label>

                        {selectedFiles.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Selected Files:
                                </p>
                                <ul className="space-y-1">
                                    {selectedFiles.map((file, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-muted rounded"
                                        >
                                            <span className="text-sm">
                                                {file.name}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setSelectedFiles(
                                                        selectedFiles.filter(
                                                            (_, i) =>
                                                                i !== index
                                                        )
                                                    )
                                                }
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Button
                            onClick={handleUpload}
                            disabled={isUploading || selectedFiles.length === 0}
                            className="w-full"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Files'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
