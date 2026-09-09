import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import {
  blogMarkdownComponents,
  normalizeBlogMarkdown,
} from '@/components/Blog/blogMarkdown';

const blogSanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src || []), 'icon'],
  },
};

/**
 * Renderiza Markdown del blog. Emojis Unicode van en línea y a color.
 */
const MarkdownBody = ({ content, className = '' }) => {
  const prepared = useMemo(
    () => normalizeBlogMarkdown(content || ''),
    [content]
  );

  if (!prepared.trim()) return null;

  return (
    <div className={`blog-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, blogSanitizeSchema]]}
        components={blogMarkdownComponents}
      >
        {prepared}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownBody;
