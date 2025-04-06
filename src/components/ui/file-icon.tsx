import { handleFileIconError } from '@/lib/google-drive'
import { cn } from '@/lib/utils'

interface FileIconProps {
    mimeType: string
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
}

export function FileIcon({ mimeType, className, size = 'md' }: FileIconProps) {
    return (
        <img
            src={`https://drive-thirdparty.googleusercontent.com/16/type/${mimeType}`}
            alt=""
            className={cn('object-contain', sizeClasses[size], className)}
            onError={handleFileIconError}
        />
    )
}
