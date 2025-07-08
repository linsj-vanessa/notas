'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ensureHTMLContent } from '@/lib/markdown-converter';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface TipTapEditorRef {
  focus: () => void;
  blur: () => void;
  getHTML: () => string;
  getText: () => string;
  getMarkdown: () => string;
}

const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(({
  content,
  onChange,
  placeholder = "Escreva sua nota...",
  className,
  editable = true,
  onFocus,
  onBlur,
}, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Typography,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount,
    ],
    content: ensureHTMLContent(content), // Converter conteúdo inicial
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onFocus,
    onBlur,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-slate max-w-none focus:outline-none',
          'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground',
          'prose-code:text-foreground prose-pre:bg-muted prose-blockquote:text-muted-foreground',
          'prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground',
          'prose-a:text-primary hover:prose-a:underline',
          className
        ),
      },
    },
  });

  // Atualizar conteúdo quando prop mudar
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Converter markdown para HTML se necessário
      const htmlContent = ensureHTMLContent(content);
      editor.commands.setContent(htmlContent);
    }
  }, [content, editor]);

  // Atualizar editabilidade
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  useImperativeHandle(ref, () => ({
    focus: () => editor?.commands.focus(),
    blur: () => editor?.commands.blur(),
    getHTML: () => editor?.getHTML() || '',
    getText: () => editor?.getText() || '',
    getMarkdown: () => {
      // Conversão básica de HTML para Markdown
      const html = editor?.getHTML() || '';
      return htmlToMarkdown(html);
    },
  }));

  return (
    <div className={cn("tiptap-editor", className)}>
      <EditorContent editor={editor} />
      <style jsx global>{`
        .tiptap-editor .ProseMirror {
          padding: 1rem 2rem;
          min-height: 200px;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 0.875rem;
          line-height: 1.625;
          background: transparent;
        }
        
        .tiptap-editor .ProseMirror:focus {
          outline: none;
        }
        
        .tiptap-editor .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        
        .tiptap-editor .ProseMirror h1,
        .tiptap-editor .ProseMirror h2,
        .tiptap-editor .ProseMirror h3,
        .tiptap-editor .ProseMirror h4,
        .tiptap-editor .ProseMirror h5,
        .tiptap-editor .ProseMirror h6 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        
        .tiptap-editor .ProseMirror h1 { font-size: 1.875rem; }
        .tiptap-editor .ProseMirror h2 { font-size: 1.5rem; }
        .tiptap-editor .ProseMirror h3 { font-size: 1.25rem; }
        .tiptap-editor .ProseMirror h4 { font-size: 1.125rem; }
        .tiptap-editor .ProseMirror h5 { font-size: 1rem; }
        .tiptap-editor .ProseMirror h6 { font-size: 0.875rem; }
        
        .tiptap-editor .ProseMirror p {
          margin-bottom: 1rem;
          color: hsl(var(--foreground));
        }
        
        .tiptap-editor .ProseMirror ul,
        .tiptap-editor .ProseMirror ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .tiptap-editor .ProseMirror li {
          margin-bottom: 0.25rem;
          color: hsl(var(--foreground));
        }
        
        .tiptap-editor .ProseMirror blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        
        .tiptap-editor .ProseMirror code {
          background-color: hsl(var(--muted));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
          color: hsl(var(--foreground));
        }
        
        .tiptap-editor .ProseMirror pre {
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .tiptap-editor .ProseMirror pre code {
          background: transparent;
          padding: 0;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
        }
        
        .tiptap-editor .ProseMirror hr {
          border: none;
          border-top: 1px solid hsl(var(--border));
          margin: 2rem 0;
        }
        
        .tiptap-editor .ProseMirror a {
          color: hsl(var(--primary));
          text-decoration: none;
        }
        
        .tiptap-editor .ProseMirror a:hover {
          text-decoration: underline;
        }
        
        .tiptap-editor .ProseMirror strong {
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        
        .tiptap-editor .ProseMirror em {
          font-style: italic;
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  );
});

TipTapEditor.displayName = 'TipTapEditor';

// Função auxiliar para converter HTML para Markdown (básica)
function htmlToMarkdown(html: string): string {
  // Esta é uma conversão básica - pode ser expandida conforme necessário
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```')
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1')
    .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<hr[^>]*>/gi, '\n---\n')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

export default TipTapEditor; 