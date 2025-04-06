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
import { formatDistanceToNow } from 'date-fns'
import { File, FileImage, FileText, Folder, Search, Upload } from 'lucide-react'
import { useState } from 'react'
import { FileUploadModal } from './FileUploadModal'

const mockFiles = [
    {
        id: '1',
        name: 'Project Documentation',
        type: 'folder',
        lastModified: new Date('2024-03-20'),
        size: 0,
    },
    {
        id: '2',
        name: 'design-mockup.fig',
        type: 'image',
        lastModified: new Date('2024-03-19'),
        size: 2500000,
    },
    {
        id: '3',
        name: 'requirements.pdf',
        type: 'document',
        lastModified: new Date('2024-03-18'),
        size: 500000,
    },
]

function getFileIcon(type: string) {
    switch (type) {
        case 'folder':
            return <Folder className="h-4 w-4 text-muted-foreground" />
        case 'image':
            return <FileImage className="h-4 w-4 text-muted-foreground" />
        case 'document':
            return <FileText className="h-4 w-4 text-muted-foreground" />
        default:
            return <File className="h-4 w-4 text-muted-foreground" />
    }
}

function formatFileSize(bytes: number) {
    if (bytes === 0) return '-'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function FileExplorer() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredFiles, setFilteredFiles] = useState(mockFiles)

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        if (!query.trim()) {
            setFilteredFiles(mockFiles)
            return
        }
        const filtered = mockFiles.filter((file) =>
            file.name.toLowerCase().includes(query.toLowerCase())
        )
        setFilteredFiles(filtered)
    }

    const handleUploadComplete = (files: File[]) => {
        // TODO: Implement file upload logic
        console.log('Files to upload:', files)
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
                                        {getFileIcon(file.type)}
                                        <span className="font-medium">
                                            {file.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {formatDistanceToNow(
                                            file.lastModified,
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
                                    No files found matching "{searchQuery}"
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
