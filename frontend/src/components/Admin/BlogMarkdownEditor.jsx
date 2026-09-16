import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Markdown } from 'tiptap-markdown';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from 'lucide-react';
import { BLOG_EMOJIS } from '@/components/Blog/blogMarkdown';

const ToolbarBtn = ({ active, disabled, onClick, title, children }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center justify-center min-w-8 h-8 px-1.5 rounded-lg text-[11px] font-black transition-colors ${
      active
        ? 'bg-primary-blue text-white'
        : 'text-admin-text-muted hover:bg-primary-blue/10 hover:text-primary-blue'
    } disabled:opacity-30`}
  >
    {children}
  </button>
);

/**
 * Editor WYSIWYG de una sola vista (TipTap).
 * El formato activo (H1, negrita…) se mantiene al seguir escribiendo.
 * Usa `contentKey` (p. ej. slug) para cargar otro artículo sin pisar la edición.
 */
const BlogMarkdownEditor = ({ value = '', onChange, height = 420, contentKey = 'default' }) => {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef(null);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3, 4, 5, 6],
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { class: 'blog-wysiwyg-link' },
        }),
        Image.configure({
          HTMLAttributes: { class: 'blog-md-image' },
        }),
        Placeholder.configure({
          placeholder: 'Escriu l’article… títols, llistes, emojis…',
        }),
        Markdown.configure({
          html: false,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      // Solo se aplica al montar / cambiar contentKey (no en cada tecla)
      content: value || '',
      editorProps: {
        attributes: {
          class: 'blog-wysiwyg-prose outline-none min-h-[280px] px-5 py-4',
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange?.(ed.storage.markdown.getMarkdown());
      },
    },
    [contentKey]
  );

  useEffect(() => {
    if (!emojiOpen) return;
    const onDocClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [emojiOpen]);

  if (!editor) {
    return (
      <div className="h-[420px] rounded-2xl border border-admin-border bg-bg-light animate-pulse" />
    );
  }

  const setHeading = (level) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const addLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('URL de l’enllaç', prev || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const insertEmoji = (emoji) => {
    editor.chain().focus().insertContent(emoji).run();
    setEmojiOpen(false);
  };

  return (
    <div
      className="blog-wysiwyg rounded-2xl overflow-hidden border border-admin-border bg-admin-card"
      style={{ minHeight: height }}
    >
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-admin-border bg-bg-light/80">
        <ToolbarBtn
          title="Negreta"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Cursiva"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Tatxat"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={15} />
        </ToolbarBtn>

        <span className="w-px h-5 bg-admin-border mx-1" />

        {[1, 2, 3, 4, 5, 6].map((level) => (
          <ToolbarBtn
            key={level}
            title={`Títol H${level}`}
            active={editor.isActive('heading', { level })}
            onClick={() => setHeading(level)}
          >
            {`H${level}`}
          </ToolbarBtn>
        ))}

        <span className="w-px h-5 bg-admin-border mx-1" />

        <ToolbarBtn
          title="Llista"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Llista numerada"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Cita"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Separador"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={15} />
        </ToolbarBtn>
        <ToolbarBtn title="Enllaç" active={editor.isActive('link')} onClick={addLink}>
          <LinkIcon size={15} />
        </ToolbarBtn>

        <span className="w-px h-5 bg-admin-border mx-1" />

        <div className="relative" ref={emojiRef}>
          <ToolbarBtn title="Emojis" active={emojiOpen} onClick={() => setEmojiOpen((o) => !o)}>
            <span className="text-base leading-none">😊</span>
          </ToolbarBtn>
          {emojiOpen && (
            <div className="absolute left-0 top-full mt-2 z-30 w-[17rem] rounded-2xl border border-admin-border bg-admin-card shadow-xl p-2 grid grid-cols-6 gap-1">
              {BLOG_EMOJIS.map(({ name, emoji }) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => insertEmoji(emoji)}
                  className="h-9 w-9 rounded-xl text-lg hover:bg-primary-blue/10 flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="w-px h-5 bg-admin-border mx-1" />

        <ToolbarBtn
          title="Desfer"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Refer"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={15} />
        </ToolbarBtn>
      </div>

      <div className="overflow-y-auto bg-admin-card" style={{ minHeight: Math.max(280, height - 56) }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default BlogMarkdownEditor;
