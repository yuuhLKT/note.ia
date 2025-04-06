import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    ExternalLink,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Underline as UnderlineIcon,
    Undo,
    Unlink,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

export function RichTextEditor({
    content,
    onChange,
    placeholder,
}: RichTextEditorProps) {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [linkText, setLinkText] = useState('')

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder || 'Start writing...',
            }),
            Highlight,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary hover:text-primary/80 underline cursor-pointer',
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Typography,
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[60vh] p-4 dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-gray-300 dark:prose-strong:text-white dark:prose-code:text-gray-300 dark:prose-pre:bg-gray-800 dark:prose-blockquote:text-gray-300 dark:prose-li:text-gray-300',
            },
            handleClick: (view, pos, event) => {
                const target = event.target as HTMLElement
                if (target.tagName === 'A') {
                    event.preventDefault()
                    const href = target.getAttribute('href')
                    if (href) {
                        window.open(href, '_blank')
                    }
                }
            },
        },
    })

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    const handleLinkClick = () => {
        if (!editor) return

        if (editor.isActive('link')) {
            const link = editor.getAttributes('link')
            setLinkUrl(link.href || '')
            const { from, to } = editor.state.selection
            setLinkText(editor.state.doc.textBetween(from, to))
        } else {
            setLinkUrl('')
            const { from, to } = editor.state.selection
            setLinkText(editor.state.doc.textBetween(from, to))
        }
        setLinkDialogOpen(true)
    }

    const handleLinkSubmit = () => {
        if (!editor) return

        if (linkUrl) {
            const formattedUrl =
                linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
                    ? linkUrl
                    : `https://${linkUrl}`

            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: formattedUrl })
                .run()
        } else {
            editor.chain().focus().unsetLink().run()
        }
        setLinkDialogOpen(false)
    }

    const handleUnlink = () => {
        if (!editor) return
        editor.chain().focus().unsetLink().run()
        setLinkDialogOpen(false)
    }

    if (!editor) {
        return null
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-card dark:bg-gray-900">
            <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/50 dark:bg-gray-800">
                <div className="flex items-center gap-1 border-r pr-2 mr-2 dark:border-gray-700">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                        data-active={editor.isActive('heading', { level: 1 })}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('heading', { level: 1 })
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                        data-active={editor.isActive('heading', { level: 2 })}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('heading', { level: 2 })
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
                        data-active={editor.isActive('heading', { level: 3 })}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('heading', { level: 3 })
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <Heading3 className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-1 border-r pr-2 mr-2 dark:border-gray-700">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        data-active={editor.isActive('bold')}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('bold')
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        data-active={editor.isActive('italic')}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('italic')
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                        data-active={editor.isActive('underline')}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('underline')
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                        data-active={editor.isActive('strike')}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('strike')
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-1 border-r pr-2 mr-2 dark:border-gray-700">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                        data-active={editor.isActive('bulletList')}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('bulletList')
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                        data-active={editor.isActive('orderedList')}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('orderedList')
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().toggleCodeBlock().run()
                        }
                        data-active={editor.isActive('codeBlock')}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('codeBlock')
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <Code className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().toggleBlockquote().run()
                        }
                        data-active={editor.isActive('blockquote')}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('blockquote')
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-1 border-r pr-2 mr-2 dark:border-gray-700">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().setTextAlign('left').run()
                        }
                        data-active={editor.isActive({ textAlign: 'left' })}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive({ textAlign: 'left' })
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().setTextAlign('center').run()
                        }
                        data-active={editor.isActive({ textAlign: 'center' })}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive({ textAlign: 'center' })
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().setTextAlign('right').run()
                        }
                        data-active={editor.isActive({ textAlign: 'right' })}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive({ textAlign: 'right' })
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            editor.chain().focus().toggleHighlight().run()
                        }
                        data-active={editor.isActive('highlight')}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('highlight')
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <Highlighter className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLinkClick}
                        data-active={editor.isActive('link')}
                        className={`dark:hover:bg-gray-700 dark:text-gray-300 ${
                            editor.isActive('link')
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                                : ''
                        }`}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        className="dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        className="dark:hover:bg-gray-700 dark:text-gray-300"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <EditorContent editor={editor} />
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Link</DialogTitle>
                        <DialogDescription>
                            Insert a link to add to your content
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="text">Text</Label>
                            <Input
                                id="text"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                placeholder="Enter link text"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="Enter URL"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        {editor.isActive('link') && (
                            <Button variant="outline" onClick={handleUnlink}>
                                <Unlink className="h-4 w-4 mr-2" />
                                Remove Link
                            </Button>
                        )}
                        <Button onClick={handleLinkSubmit}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Add Link
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
