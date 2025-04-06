import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { DriveFile } from '@/types'
import { Cloud, Upload } from 'lucide-react'

interface DriveUploadProps {
    onAuthStart?: () => void
    onUploadComplete?: (file: DriveFile) => void
}

export function DriveUpload({
    onAuthStart,
    onUploadComplete,
}: DriveUploadProps) {
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        // TODO: Implement file upload logic
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" className="flex-1">
                    <Cloud className="mr-2 h-4 w-4" />
                    Connect Google Drive
                </Button>
                <Button variant="outline" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                </Button>
            </div>
            <Card
                className="border-2 border-dashed p-8 text-center hover:border-primary/50 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Drag and drop your files here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Supported formats: PDF, DOC, XLS, PPT, JPG, PNG
                    </p>
                </div>
            </Card>
        </div>
    )
}
