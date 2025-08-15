// components/keluhkesah/CommentsSection.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Comment } from 'app/constants/KeluhKesahConstants';

interface CommentsSectionProps {
    entryId: string;
    currentComments: Comment[];
    isLoadingComments: boolean;
    newCommentName: string;
    setNewCommentName: (name: string) => void;
    newCommentText: string;
    setNewCommentText: (text: string) => void;
    submittingCommentFor: string | null;
    onCommentSubmit: (entryId: string) => Promise<void>;
}

const commentSectionVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.4, ease: 'easeOut' } },
};

const commentItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

const CommentsSection: React.FC<CommentsSectionProps> = ({
    entryId,
    currentComments,
    isLoadingComments,
    newCommentName,
    setNewCommentName,
    newCommentText,
    setNewCommentText,
    submittingCommentFor,
    onCommentSubmit,
}) => {
    return (
        <AnimatePresence>
            <motion.div
                key="comments-section"
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-5 pt-5 border-t border-surface0/50 space-y-4"
            >
                {currentComments.length === 0 && !isLoadingComments ? (
                    <p className="text-sm text-subtext1 text-center italic py-3 opacity-70">
                        Belum ada komentar di sini. Jadilah yang pertama! 💬
                    </p>
                ) : (
                    currentComments.map((comment, commentIndex) => (
                        <motion.div
                            key={comment.id}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: commentIndex * 0.08 }}
                            className="bg-surface0/70 backdrop-blur-sm p-4 rounded-lg border border-surface1/50 flex flex-col shadow-sm"
                        >
                            <p className="text-sm font-semibold text-text flex items-center gap-1 leading-tight">
                                {comment.name} <span className="text-xs text-subtext1 font-light opacity-90">mengomentari:</span>
                            </p>
                            <p className="text-sm text-white italic mt-1 leading-relaxed">"{comment.comment}"</p>
                            <p className="text-xs text-subtext1 mt-2 text-right opacity-70">
                                {new Date(comment.timestamp?.toDate()).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </motion.div>
                    ))
                )}

                <div className="mt-5 p-5 bg-surface0/70 backdrop-blur-sm rounded-xl border border-surface1/50 shadow-inner">
                    <h3 className="text-base sm:text-lg font-semibold text-mauve mb-4">Tambah Komentar Baru:</h3>
                    <input
                        type="text"
                        placeholder="Nama kamu (opsional, maks 30 karakter)"
                        value={newCommentName}
                        onChange={(e) => setNewCommentName(e.target.value)}
                        className="w-full p-3 mb-3 rounded-lg bg-base/60 text-white focus:outline-none focus:ring-2 focus:ring-lavender placeholder-subtext1 text-sm sm:text-base border border-surface0"
                        maxLength={30}
                    />
                    <textarea
                        placeholder="Ketik komentar di sini... (maks 200 karakter)"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="w-full p-3 rounded-lg bg-base/60 text-white focus:outline-none focus:ring-2 focus:ring-lavender resize-y min-h-[70px] max-h-[150px] placeholder-subtext1 text-sm sm:text-base border border-surface0"
                        rows={3}
                        maxLength={200}
                        required
                    ></textarea>
                    <p className="text-right text-xs text-subtext1 mt-2 opacity-80">
                        {newCommentText.length} / 200 karakter
                    </p>
                    <motion.button
                        onClick={() => onCommentSubmit(entryId)}
                        whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(var(--color-pink-rgb), 0.7)' }}
                        whileTap={{ scale: 0.95 }}
                        className={`mt-4 w-full py-2.5 px-4 rounded-lg font-bold text-white transition duration-300 flex items-center justify-center gap-2 text-base sm:text-lg
              ${submittingCommentFor === entryId ? 'bg-mauve/60 cursor-not-allowed' : 'bg-lavender hover:bg-pink hover:shadow-lg'}`}
                        disabled={submittingCommentFor === entryId}
                    >
                        {submittingCommentFor === entryId ? (
                            <>Mengirim... <span className="animate-spin">🌀</span></>
                        ) : (
                            <>Kirim Komentar <span className="text-xl">🎉</span></>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommentsSection;