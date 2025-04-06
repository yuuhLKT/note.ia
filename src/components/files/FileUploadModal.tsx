import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'

interface FileUploadModalProps {
    trigger?: React.ReactNode
    onUploadComplete?: (files: File[]) => void
    accept?: string
    maxSize?: number // in bytes
}

export function FileUploadModal({
    trigger,
    onUploadComplete,
    accept = '*',
    maxSize = 10 * 1024 * 1024, // 10MB default
}: FileUploadModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [error, setError] = useState<string>('')
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
        setError('')
        const droppedFiles = Array.from(e.dataTransfer.files)
        validateAndSetFiles(droppedFiles)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('')
        const selectedFiles = Array.from(e.target.files || [])
        validateAndSetFiles(selectedFiles)
    }

    const validateAndSetFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter((file) => {
            if (file.size > maxSize) {
                setError(
                    `File ${file.name} exceeds the maximum size limit of ${maxSize / (1024 * 1024)}MB`
                )
                return false
            }
            return true
        })
        setFiles((prev) => [...prev, ...validFiles])
    }

    const handleUpload = () => {
        if (files.length === 0) {
            setError('Please select at least one file to upload')
            return
        }
        onUploadComplete?.(files)
        setFiles([])
        setIsOpen(false)
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleDragAreaClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Files
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                        Select files to upload or drag and drop them here
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Card
                        className={`border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                            isDragging
                                ? 'border-primary bg-primary/5'
                                : 'hover:border-primary/50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleDragAreaClick}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                                <Upload className="h-8 w-8 text-muted-foreground" />
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
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept={accept}
                                onChange={handleFileInput}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="text-sm text-primary cursor-pointer hover:underline"
                            >
                                Browse files
                            </label>
                        </div>
                    </Card>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    {files.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">
                                Selected files:
                            </h4>
                            <div className="space-y-2">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                                    >
                                        <span className="text-sm">
                                            {file.name}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpload}>Upload</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
