// components/notebook.tsx

import React from 'react';

// Styles reused across files live here as components and class lists (Tailwind's
// "managing duplication" guidance) instead of custom CSS classes.

export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export const primaryButton = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-[3px] bg-accent px-5 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent ${focusRing}`;

export const quietButton = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-[3px] border border-ink/25 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;

export const textLink = `cursor-pointer text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent ${focusRing}`;

export const inputField = `w-full rounded-[3px] border border-rule bg-paper-raised px-3 py-2.5 text-base text-ink placeholder:text-muted/70 ${focusRing}`;

// Textareas are written straight onto the ruled paper, without a box
export const ruledField = `ruled block w-full resize-y bg-transparent px-1 font-serif text-body text-ink placeholder:text-muted/70 ${focusRing}`;

export const metaLabel = 'text-xs tracking-[0.08em] text-muted uppercase';

// Highlighter swipe, switched on by the caller with aria-pressed:/aria-[current=page]: variants.
// It covers the full glyph height because the text switches to on-highlight,
// which would vanish against the dark paper wherever the swipe didn't reach.
export const stabilo = 'bg-linear-to-r from-highlight to-highlight bg-size-[0%_85%] bg-position-[0_50%] bg-no-repeat transition-[background-size,background-color] duration-300 ease-out motion-reduce:transition-none';

type RowTag = 'div' | 'header' | 'footer' | 'section' | 'article';

interface NotebookRowProps extends React.HTMLAttributes<HTMLElement> {
    as?: RowTag;
    // Sits left of the red line on wide screens and stacks above the content on phones
    margin?: React.ReactNode;
}

export const NotebookRow: React.FC<NotebookRowProps> = ({ as: Tag = 'div', margin, className = '', children, ...rest }) => {
    return (
        <Tag className={`md:grid md:grid-cols-[var(--margin-col)_minmax(0,1fr)] ${className}`} {...rest}>
            <div className="min-w-0 pl-4 md:pr-5 md:pl-0 md:text-right">{margin}</div>
            <div className="min-w-0 pl-4 md:pl-6">{children}</div>
        </Tag>
    );
};
