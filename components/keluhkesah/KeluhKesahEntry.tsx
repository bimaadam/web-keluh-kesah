// components/keluhkesah/KeluhKesahEntry.tsx
'use client';

import React from 'react';
import { Entry, Comment, reactions } from "app/constants/KeluhKesahConstants"
import ReactionsPanel from './ReactionsPanel';
import CommentsSection from './CommentsSection';

interface KeluhKesahEntryProps {
    entry: Entry;
    votedReactions: { [entryId: string]: { [reactionType: string]: boolean } };
    expandedComments: { [entryId: string]: boolean };
    commentsData: { [entryId: string]: Comment[] };
    submittingCommentFor: string | null;
    onReactionClick: (entryId: string, reactionType: keyof typeof reactions) => Promise<void>;
    onToggleComments: (entryId: string) => Promise<void>;
    onCommentSubmit: (entryId: string, name: string, text: string) => Promise<boolean>;
}

const KeluhKesahEntry: React.FC<KeluhKesahEntryProps> = ({
    entry,
    votedReactions,
    expandedComments,
    commentsData,
    submittingCommentFor,
    onReactionClick,
    onToggleComments,
    onCommentSubmit,
}) => {
    const isCommentsExpanded = !!expandedComments[entry.id];
    const loadedComments = commentsData[entry.id];
    const currentComments = loadedComments || [];
    // Comments are only fetched when a section is opened, so the count is unknown until then
    const commentCountLabel = loadedComments ? ` (${currentComments.length})` : '';

    const date: Date | undefined = entry.timestamp?.toDate?.();
    const isThisYear = date?.getFullYear() === new Date().getFullYear();

    return (
        <article className="nb-row pb-[calc(var(--line)*2)]">
            {/* Like a notebook margin: the date goes left of the red line */}
            <div className="nb-margin">
                {date ? (
                    <time dateTime={date.toISOString()} className="block text-xs leading-line tabular-nums text-muted">
                        <span>{date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: isThisYear ? undefined : 'numeric' })}</span>
                        <span className="md:hidden"> · </span>
                        <span className="md:block">{date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                    </time>
                ) : (
                    <span className="block text-xs leading-line text-muted">Tanpa tanggal</span>
                )}
            </div>

            <div className="nb-body">
                <p className="ruled whitespace-pre-wrap break-words font-serif text-[1.0625rem]">
                    {entry.message}
                </p>
                <p className="mt-1 text-sm text-muted">— {entry.name?.trim() || 'Anonim'}</p>

                <ReactionsPanel
                    entryId={entry.id}
                    entryData={entry}
                    votedReactions={votedReactions}
                    onReactionClick={onReactionClick}
                />

                <button
                    type="button"
                    onClick={() => onToggleComments(entry.id)}
                    aria-expanded={isCommentsExpanded}
                    className="link mt-3"
                >
                    {isCommentsExpanded ? 'Tutup komentar' : `Komentar${commentCountLabel}`}
                </button>

                {isCommentsExpanded && (
                    <CommentsSection
                        entryId={entry.id}
                        currentComments={currentComments}
                        isLoadingComments={!loadedComments}
                        submittingCommentFor={submittingCommentFor}
                        onCommentSubmit={onCommentSubmit}
                    />
                )}
            </div>
        </article>
    );
};

export default KeluhKesahEntry;
