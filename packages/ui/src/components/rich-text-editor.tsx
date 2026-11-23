import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import {
  ArrowArcLeftIcon,
  ArrowArcRightIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  QuotesIcon,
  TextBIcon,
  TextHTwoIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
} from '@phosphor-icons/react'

import { useGoGoUIMessages } from '../i18n/messages-context.ts'
import { cn } from '../lib/cn.ts'
import { Button } from './button.tsx'
import { Separator } from './separator.tsx'
import { Toggle } from './toggle.tsx'

type RichTextEditorProps = {
  /** The text as HTML, read when the editor opens. */
  defaultValue?: string
  /** Called with the HTML at each change. */
  onValueChange?: (html: string) => void
  placeholder?: string
  /** The editor's id, for a label's `htmlFor` (use FieldShell). */
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  disabled?: boolean
  className?: string
}

/**
 * A text with bold, italics, titles and lists (Tiptap).
 *
 * **Use it for** an e-mail template, a description, a contract clause.
 * **Prefer** `TextareaField` for plain text.
 *
 * **Where**: in a form or a settings page, full width.
 *
 * **States**: empty (placeholder), editing, disabled.
 *
 * **Key props**: `defaultValue` (HTML), `onValueChange` (HTML),
 * `placeholder`, `disabled`, `extensions` (add your Tiptap ones).
 *
 * **Accessibility**: the toolbar buttons are named and pressed; the usual
 * shortcuts work (Ctrl B, Ctrl I).
 *
 * @summary A text editor with bold, titles and lists.
 */
function RichTextEditor({
  defaultValue = '',
  onValueChange,
  placeholder,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  disabled = false,
  className,
}: RichTextEditorProps) {
  const messages = useGoGoUIMessages()
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: defaultValue,
    editable: !disabled,
    // Rendered in the browser only: no mismatch with a server's HTML.
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => onValueChange?.(current.getHTML()),
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        role: 'textbox',
        'aria-multiline': 'true',
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
        ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
        ...(ariaInvalid ? { 'aria-invalid': 'true' } : {}),
        class:
          'min-h-32 px-3 py-2 outline-none [&_h2]:text-lg [&_h2]:font-medium [&_h3]:font-medium [&_ol]:list-decimal [&_ol]:ps-5 [&_ul]:list-disc [&_ul]:ps-5 [&_blockquote]:border-s-2 [&_blockquote]:border-line-strong [&_blockquote]:ps-3 [&_blockquote]:text-fg-muted [&_p]:my-1 [&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-fg-subtle [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
      },
    },
  })

  // Which buttons are on, read from the editor as it changes.
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive('bold') ?? false,
      italic: current?.isActive('italic') ?? false,
      strike: current?.isActive('strike') ?? false,
      heading: current?.isActive('heading', { level: 2 }) ?? false,
      bulletList: current?.isActive('bulletList') ?? false,
      orderedList: current?.isActive('orderedList') ?? false,
      blockquote: current?.isActive('blockquote') ?? false,
      canUndo: current?.can().undo() ?? false,
      canRedo: current?.can().redo() ?? false,
    }),
  })

  const chain = () => editor?.chain().focus()
  const tools = [
    {
      label: messages.bold,
      icon: TextBIcon,
      on: active?.bold,
      run: () => chain()?.toggleBold().run(),
    },
    {
      label: messages.italic,
      icon: TextItalicIcon,
      on: active?.italic,
      run: () => chain()?.toggleItalic().run(),
    },
    {
      label: messages.strike,
      icon: TextStrikethroughIcon,
      on: active?.strike,
      run: () => chain()?.toggleStrike().run(),
    },
    {
      label: messages.heading,
      icon: TextHTwoIcon,
      on: active?.heading,
      run: () => chain()?.toggleHeading({ level: 2 }).run(),
    },
    {
      label: messages.bulletList,
      icon: ListBulletsIcon,
      on: active?.bulletList,
      run: () => chain()?.toggleBulletList().run(),
    },
    {
      label: messages.orderedList,
      icon: ListNumbersIcon,
      on: active?.orderedList,
      run: () => chain()?.toggleOrderedList().run(),
    },
    {
      label: messages.quote,
      icon: QuotesIcon,
      on: active?.blockquote,
      run: () => chain()?.toggleBlockquote().run(),
    },
  ]

  return (
    <div
      data-slot="rich-text-editor"
      className={cn(
        'overflow-hidden rounded-lg bg-field text-sm text-fg shadow-field ring-1 ring-field-line ring-inset focus-within:ring-line-focus has-aria-invalid:ring-danger',
        disabled && 'bg-subtle text-fg-disabled',
        className,
      )}
    >
      <div
        role="toolbar"
        aria-label={messages.formatting}
        className="flex flex-wrap items-center gap-0.5 border-b border-line p-1"
      >
        {tools.map(({ label, icon: Icon, on, run }) => (
          <Toggle
            key={label}
            size="sm"
            aria-label={label}
            title={label}
            pressed={on ?? false}
            disabled={disabled}
            onPressedChange={() => run()}
          >
            <Icon />
          </Toggle>
        ))}
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={messages.undo2}
          title={messages.undo2}
          disabled={disabled || !active?.canUndo}
          onClick={() => chain()?.undo().run()}
        >
          <ArrowArcLeftIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={messages.redo}
          title={messages.redo}
          disabled={disabled || !active?.canRedo}
          onClick={() => chain()?.redo().run()}
        >
          <ArrowArcRightIcon />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export { RichTextEditor }
export type { RichTextEditorProps }
