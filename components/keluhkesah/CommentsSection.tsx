// components/keluhkesah/CommentsSection.tsx
'use client';

import React, { useState } from 'react';
import { Comment } from 'app/constants/KeluhKesahConstants';

interface CommentsSectionProps {
    entryId: string;
    currentComments: Comment[];
    isLoadingComments: boolean;
    submittingCommentFor: string | null;
    onCommentSubmit: (entryId: string, name: string, text: string) => Promise<boolean>;
}

const MAX_COMMENT_LENGTH = 200;

const CommentsSection: React.FC<CommentsSectionProps> = ({
    entryId,
    currentComments,
    isLoadingComments,
    submittingCommentFor,
    onCommentSubmit,
}) => {
    // Kept per section so typing in one entry's form doesn't show up in another
    const [newCommentName, setNewCommentName] = useState('');
    const [newCommentText, setNewCommentText] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isSaved = await onCommentSubmit(entryId, newCommentName, newCommentText);
        if (isSaved) {
            setNewCommentName('');
            setNewCommentText('');
        }
    };

    // Wait for existing comments first, otherwise the loaded list would replace a comment shown before it arrived
    const isSubmitDisabled = submittingCommentFor === entryId || isLoadingComments;

    return (
        <div className="mt-4 md:pl-6">
            {isLoadingComments ? (
                <p className="text-sm text-muted">Memuat komentar…</p>
            ) : currentComments.length === 0 ? (
                <p className="text-sm text-muted">Belum ada komentar. Jadi yang pertama.</p>
            ) : (
                <ul className="grid gap-4">
                    {currentComments.map(comment => {
                        const time = comment.timestamp?.toDate?.().toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        });

                        return (
                            <li key={comment.id}>
                                <p className="text-xs text-muted">
                                    <span className="font-medium text-ink">{comment.name}</span>
                                    {time && <> · {time}</>}
                                </p>
                                <p className="mt-0.5 whitespace-pre-wrap break-words font-serif text-[0.9375rem] leading-relaxed">
                                    {comment.comment}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            )}

            <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
                <input
                    type="text"
                    id={`comment-name-${entryId}`}
                    aria-label="Nama"
                    placeholder="Nama (boleh dikosongin)"
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    className="field max-w-[22rem] text-sm"
                    maxLength={30}
                />
                <textarea
                    id={`comment-text-${entryId}`}
                    aria-label="Komentar"
                    placeholder="Tulis komentar…"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="field-ruled text-base"
                    rows={3}
                    maxLength={MAX_COMMENT_LENGTH}
                    required
                ></textarea>
                <div className="flex items-center justify-between gap-3">
                    <span className="text-xs tabular-nums text-muted">
                        {newCommentText.length}/{MAX_COMMENT_LENGTH}
                    </span>
                    <button type="submit" disabled={isSubmitDisabled} className="btn-primary">
                        {submittingCommentFor === entryId ? 'Mengirim…' : 'Kirim komentar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommentsSection;
