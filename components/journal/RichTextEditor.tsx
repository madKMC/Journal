'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState({
    bold: false,
    italic: false,
    bulletList: false,
    numberedList: false,
    blockquote: false,
  })

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          execCommand('bold')
          break
        case 'i':
          e.preventDefault()
          execCommand('italic')
          break
        case 'z':
          if (e.shiftKey) {
            e.preventDefault()
            execCommand('redo')
          } else {
            e.preventDefault()
            execCommand('undo')
          }
          break
      }
    }
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    updateActiveStates()
    handleInput()
  }

  const updateActiveStates = () => {
    setIsActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      bulletList: document.queryCommandState('insertUnorderedList'),
      numberedList: document.queryCommandState('insertOrderedList'),
      blockquote: document.queryCommandState('formatBlock') && document.queryCommandValue('formatBlock') === 'blockquote',
    })
  }

  const handleSelectionChange = () => {
    updateActiveStates()
  }

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag)
  }

  return (
    <div className="border border-sage-200 rounded-lg overflow-hidden focus-within:border-sage-400 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-sage-200 bg-sage-50/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            isActive.bold && "bg-sage-200 text-sage-800"
          )}
          onClick={() => execCommand('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            isActive.italic && "bg-sage-200 text-sage-800"
          )}
          onClick={() => execCommand('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-sage-200 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            isActive.bulletList && "bg-sage-200 text-sage-800"
          )}
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            isActive.numberedList && "bg-sage-200 text-sage-800"
          )}
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            isActive.blockquote && "bg-sage-200 text-sage-800"
          )}
          onClick={() => formatBlock('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-sage-200 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('undo')}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('redo')}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-h-[300px] p-4 text-base leading-relaxed focus:outline-none",
          "prose prose-sm max-w-none",
          "[&_strong]:font-semibold [&_em]:italic",
          "[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6",
          "[&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-sage-300",
          "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-mutedgray-600",
          "text-charcoal-700",
          className
        )}
        data-placeholder={placeholder}
        style={{
          minHeight: '300px',
        }}
        suppressContentEditableWarning={true}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #7d7d7d;
          pointer-events: none;
          position: absolute;
        }
      `}</style>
    </div>
  )
}