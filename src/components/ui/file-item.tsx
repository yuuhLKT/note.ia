import { cn } from '@/lib/utils'
import { DriveFile } from '@/types'
import { FileIcon } from './file-icon'

interface FileItemProps {
    file: DriveFile
    className?: string
    showIcon?: boolean
    showSize?: boolean
    showDate?: boolean
    onRemove?: () => void
}

export function FileItem({
    file,
    className,
    showIcon = true,
    showSize = false,
    showDate = false,
    onRemove,
}: FileItemProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 p-2 bg-muted/50 rounded',
                className
            )}
        >
            {showIcon && <FileIcon mimeType={file.mimeType} />}
            <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                {(showSize || showDate) && (
                    <div className="flex gap-2 text-xs text-muted-foreground">
                        {showSize && <span>{formatFileSize(file.size)}</span>}
                        {showDate && (
                            <span>
                                {file.lastModified.toLocaleDateString()}
                            </span>
                        )}
                    </div>
                )}
            </div>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="text-muted-foreground hover:text-destructive"
                >
                    ×
                </button>
            )}
        </div>
    )
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
