import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { DriveFile } from '@/types'
import { Cloud, Upload } from 'lucide-react'
import { useState } from 'react'
import { FileUploadModal } from './FileUploadModal'

interface DriveUploadProps {
    onAuthStart?: () => void
    onUploadComplete?: (file: DriveFile) => void
}

export function DriveUpload({
    onAuthStart,
    onUploadComplete,
}: DriveUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const handleFileUpload = (files: File[]) => {
        // TODO: Implement file upload logic
        console.log('Files to upload:', files)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = Array.from(e.dataTransfer.files)
        handleFileUpload(files)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onAuthStart}
                >
                    <Cloud className="mr-2 h-4 w-4" />
                    Connect Google Drive
                </Button>
                <FileUploadModal
                    trigger={
                        <Button variant="outline" className="flex-1">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Files
                        </Button>
                    }
                    onUploadComplete={handleFileUpload}
                />
            </div>
            <Card
                className={`border-2 border-dashed p-8 text-center transition-colors ${
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center gap-2">
                    <FileUploadModal
                        trigger={
                            <div className="flex flex-col items-center gap-2 cursor-pointer">
                                <div className="relative">
                                    <Cloud className="h-8 w-8 text-muted-foreground" />
                                    {isDragging && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="animate-ping h-8 w-8 rounded-full bg-primary/20" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {isDragging
                                        ? 'Drop your files here'
                                        : 'Drag and drop your files here or click to browse'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Supported formats: PDF, DOC, XLS, PPT, JPG,
                                    PNG
                                </p>
                            </div>
                        }
                        onUploadComplete={handleFileUpload}
                    />
                </div>
            </Card>
        </div>
    )
}
