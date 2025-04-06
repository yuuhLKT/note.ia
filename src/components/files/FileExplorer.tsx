import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import { listFiles, uploadFile } from '@/services/googleDrive'
import { formatDistanceToNow } from 'date-fns'
import { File, FileImage, FileText, Folder, Search, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FileUploadModal } from './FileUploadModal'

interface DriveFile {
    id: string
    name: string
    mimeType: string
    modifiedTime: string
    size?: string
}

function getFileIcon(mimeType: string) {
    if (mimeType === 'application/vnd.google-apps.folder') {
        return <Folder className="h-4 w-4 text-muted-foreground" />
    }
    if (mimeType.startsWith('image/')) {
        return <FileImage className="h-4 w-4 text-muted-foreground" />
    }
    if (mimeType.includes('document') || mimeType.includes('pdf')) {
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
    return <File className="h-4 w-4 text-muted-foreground" />
}

function formatFileSize(bytes: string | undefined) {
    if (!bytes) return '-'
    const size = parseInt(bytes)
    if (size === 0) return '-'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return `${parseFloat((size / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function FileExplorer() {
    const [searchQuery, setSearchQuery] = useState('')
    const [files, setFiles] = useState<DriveFile[]>([])
    const [filteredFiles, setFilteredFiles] = useState<DriveFile[]>([])
    const { isConnected } = useGoogleDrive()

    useEffect(() => {
        if (isConnected) {
            loadFiles()
        }
    }, [isConnected])

    const loadFiles = async () => {
        try {
            const driveFiles = await listFiles()
            setFiles(driveFiles)
            setFilteredFiles(driveFiles)
        } catch (error) {
            console.error('Error loading files:', error)
        }
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        if (!query.trim()) {
            setFilteredFiles(files)
            return
        }
        const filtered = files.filter((file) =>
            file.name.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredFiles(filtered)
    }

    const handleUploadComplete = async (files: File[]) => {
        try {
            for (const file of files) {
                await uploadFile(file)
            }
            await loadFiles()
        } catch (error) {
            console.error('Error uploading files:', error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search files..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <FileUploadModal
                    trigger={
                        <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Files
                        </Button>
                    }
                    onUploadComplete={handleUploadComplete}
                />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50%]">Name</TableHead>
                            <TableHead>Last Modified</TableHead>
                            <TableHead className="text-right">Size</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredFiles.length > 0 ? (
                            filteredFiles.map((file) => (
                                <TableRow
                                    key={file.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                >
                                    <TableCell className="flex items-center gap-2">
                                        {getFileIcon(file.mimeType)}
                                        <span className="font-medium">
                                            {file.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {formatDistanceToNow(
                                            new Date(file.modifiedTime),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatFileSize(file.size)}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="text-center py-4"
                                >
                                    {searchQuery
                                        ? `No files found matching "${searchQuery}"`
                                        : 'No files uploaded yet'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
