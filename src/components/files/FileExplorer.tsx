import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useGoogleDrive } from '@/hooks/use-google-drive'
import {
    deleteFile,
    downloadFile,
    getAccessToken,
    listFiles,
    listTrashedFiles,
    restoreFile,
} from '@/services/googleDrive'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    Download,
    ExternalLink,
    File,
    FileImage,
    FileText,
    Folder,
    FolderOpen,
    MoreVertical,
    Search,
    Trash2,
    Undo2,
    Upload,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { FileUploadModal } from './FileUploadModal'

interface DriveFile {
    id: string
    name: string
    mimeType: string
    modifiedTime: string
    size?: string
    webViewLink?: string
}

function getFileIcon(mimeType: string) {
    if (mimeType === 'application/vnd.google-apps.folder') {
        return <Folder className="h-5 w-5 text-yellow-500" />
    }
    if (mimeType.startsWith('image/')) {
        return <FileImage className="h-5 w-5 text-blue-500" />
    }
    if (mimeType.includes('document') || mimeType.includes('pdf')) {
        return <FileText className="h-5 w-5 text-red-500" />
    }
    return <File className="h-5 w-5 text-gray-500" />
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
    const [trashedFiles, setTrashedFiles] = useState<DriveFile[]>([])
    const [filteredFiles, setFilteredFiles] = useState<DriveFile[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [currentFolder, setCurrentFolder] = useState<string | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
    const { isConnected } = useGoogleDrive()
    const { toast } = useToast()
    const [currentTab, setCurrentTab] = useState('files')

    useEffect(() => {
        if (isConnected) {
            loadFiles()
            loadTrashedFiles()
        }
    }, [isConnected, currentFolder])

    const loadFiles = async () => {
        if (!isConnected) return

        setIsLoading(true)
        try {
            const driveFiles = await listFiles(currentFolder)
            setFiles(driveFiles)
            setFilteredFiles(driveFiles)
        } catch (error) {
            console.error('Error loading files:', error)
            toast({
                title: 'Error',
                description: 'Failed to load files',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const loadTrashedFiles = async () => {
        if (!isConnected) return

        try {
            const trashed = await listTrashedFiles()
            setTrashedFiles(trashed)
        } catch (error) {
            console.error('Error loading trashed files:', error)
            toast({
                title: 'Error',
                description: 'Failed to load trashed files',
                variant: 'destructive',
            })
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

    const handleUploadComplete = async () => {
        await loadFiles()
    }

    const handleFileClick = (file: DriveFile) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            setCurrentFolder(file.id)
        } else if (file.webViewLink) {
            window.open(file.webViewLink, '_blank')
        }
    }

    const handleDownload = async (file: DriveFile) => {
        try {
            await downloadFile(file.id, file.name)
            toast({
                title: 'Success',
                description: 'File downloaded successfully',
            })
        } catch (error) {
            console.error('Error downloading file:', error)
            toast({
                title: 'Error',
                description: 'Failed to download file',
                variant: 'destructive',
            })
        }
    }

    const handleDelete = async (file: DriveFile) => {
        try {
            await deleteFile(file.id)
            await loadFiles()
            await loadTrashedFiles()
            toast({
                title: 'Success',
                description: 'File moved to trash',
            })
        } catch (error) {
            console.error('Error deleting file:', error)
            toast({
                title: 'Error',
                description: 'Failed to delete file',
                variant: 'destructive',
            })
        }
    }

    const handleRestore = async (file: DriveFile) => {
        try {
            await restoreFile(file.id)
            await loadFiles()
            await loadTrashedFiles()
            toast({
                title: 'Success',
                description: 'File restored successfully',
            })
        } catch (error) {
            console.error('Error restoring file:', error)
            toast({
                title: 'Error',
                description: 'Failed to restore file',
                variant: 'destructive',
            })
        }
    }

    const handlePermanentDelete = async (file: DriveFile) => {
        try {
            await axios.delete(
                `https://www.googleapis.com/drive/v3/files/${file.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${getAccessToken()}`,
                    },
                }
            )
            await loadTrashedFiles()
            toast({
                title: 'Success',
                description: 'File permanently deleted',
            })
        } catch (error) {
            console.error('Error permanently deleting file:', error)
            toast({
                title: 'Error',
                description: 'Failed to permanently delete file',
                variant: 'destructive',
            })
        }
    }

    const handleSelectAll = () => {
        if (selectedFiles.size === filteredFiles.length) {
            setSelectedFiles(new Set())
        } else {
            setSelectedFiles(new Set(filteredFiles.map((file) => file.id)))
        }
    }

    const handleSelectFile = (fileId: string) => {
        const newSelected = new Set(selectedFiles)
        if (newSelected.has(fileId)) {
            newSelected.delete(fileId)
        } else {
            newSelected.add(fileId)
        }
        setSelectedFiles(newSelected)
    }

    const handleBatchDelete = async () => {
        try {
            if (currentTab === 'trash') {
                for (const fileId of selectedFiles) {
                    await axios.delete(
                        `https://www.googleapis.com/drive/v3/files/${fileId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${getAccessToken()}`,
                            },
                        }
                    )
                }
                await loadTrashedFiles()
                toast({
                    title: 'Success',
                    description: 'Files permanently deleted',
                })
            } else {
                for (const fileId of selectedFiles) {
                    await deleteFile(fileId)
                }
                await loadFiles()
                await loadTrashedFiles()
                toast({
                    title: 'Success',
                    description: 'Files moved to trash',
                })
            }
            setSelectedFiles(new Set())
        } catch (error) {
            console.error('Error deleting files:', error)
            toast({
                title: 'Error',
                description: 'Failed to delete files',
                variant: 'destructive',
            })
        }
    }

    const handleBatchDownload = async () => {
        try {
            for (const fileId of selectedFiles) {
                const file = files.find((f) => f.id === fileId)
                if (
                    file &&
                    file.mimeType !== 'application/vnd.google-apps.folder'
                ) {
                    await downloadFile(fileId, file.name)
                }
            }
            toast({
                title: 'Success',
                description: 'Files downloaded successfully',
            })
        } catch (error) {
            console.error('Error downloading files:', error)
            toast({
                title: 'Error',
                description: 'Failed to download files',
                variant: 'destructive',
            })
        }
    }

    const renderFileTable = (files: DriveFile[], isTrash: boolean = false) => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[30px]">
                            <Checkbox
                                checked={
                                    selectedFiles.size === files.length &&
                                    files.length > 0
                                }
                                onCheckedChange={handleSelectAll}
                            />
                        </TableHead>
                        <TableHead className="w-[50%]">Name</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="text-right">Size</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                                Loading files...
                            </TableCell>
                        </TableRow>
                    ) : files.length > 0 ? (
                        files.map((file) => (
                            <TableRow
                                key={file.id}
                                className="hover:bg-muted/50"
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedFiles.has(file.id)}
                                        onCheckedChange={() =>
                                            handleSelectFile(file.id)
                                        }
                                    />
                                </TableCell>
                                <TableCell
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => handleFileClick(file)}
                                >
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
                                            locale: ptBR,
                                        }
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatFileSize(file.size)}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {file.mimeType !==
                                                'application/vnd.google-apps.folder' && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDownload(file)
                                                        }
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    {file.webViewLink && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                window.open(
                                                                    file.webViewLink,
                                                                    '_blank'
                                                                )
                                                            }
                                                        >
                                                            <ExternalLink className="mr-2 h-4 w-4" />
                                                            Open
                                                        </DropdownMenuItem>
                                                    )}
                                                </>
                                            )}
                                            {isTrash ? (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleRestore(file)
                                                        }
                                                    >
                                                        <Undo2 className="mr-2 h-4 w-4" />
                                                        Restore
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() =>
                                                            handlePermanentDelete(
                                                                file
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Permanently
                                                    </DropdownMenuItem>
                                                </>
                                            ) : (
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() =>
                                                        handleDelete(file)
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Move to Trash
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                                {searchQuery
                                    ? `No files found matching "${searchQuery}"`
                                    : 'No files found'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                {currentFolder && (
                    <Button
                        variant="outline"
                        onClick={() => setCurrentFolder(null)}
                        className="flex items-center gap-2"
                    >
                        <FolderOpen className="h-4 w-4" />
                        Back to Root
                    </Button>
                )}
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
            {selectedFiles.size > 0 && (
                <div className="flex items-center gap-4 bg-muted p-2 rounded-md">
                    <span className="text-sm font-medium">
                        {selectedFiles.size} file
                        {selectedFiles.size > 1 ? 's' : ''} selected
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBatchDownload}
                        disabled={
                            !Array.from(selectedFiles).some(
                                (id) =>
                                    files.find((f) => f.id === id)?.mimeType !==
                                    'application/vnd.google-apps.folder'
                            )
                        }
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download Selected
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBatchDelete}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {currentTab === 'trash'
                            ? 'Delete Permanently'
                            : 'Move to Trash'}
                    </Button>
                </div>
            )}
            <Tabs defaultValue="files" onValueChange={setCurrentTab}>
                <TabsList>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="trash">Trash</TabsTrigger>
                </TabsList>
                <TabsContent value="files">
                    {renderFileTable(filteredFiles)}
                </TabsContent>
                <TabsContent value="trash">
                    {renderFileTable(trashedFiles, true)}
                </TabsContent>
            </Tabs>
        </div>
    )
}
