// components/keluhkesah/KeluhKesahEntry.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Entry, Comment, getRandomEmoji, reactions } from "app/constants/KeluhKesahConstants"
import ReactionsPanel from './ReactionsPanel';
import CommentsSection from './CommentsSection';

interface KeluhKesahEntryProps {
    entry: Entry;
    entryVariants: { [key: string]: any };
    index: number;
    votedReactions: { [entryId: string]: { [reactionType: string]: boolean } };
    expandedComments: { [entryId: string]: boolean };
    commentsData: { [entryId: string]: Comment[] };
    newCommentName: string;
    setNewCommentName: (name: string) => void;
    newCommentText: string;
    setNewCommentText: (text: string) => void;
    submittingCommentFor: string | null;
    onReactionClick: (entryId: string, reactionType: keyof typeof reactions) => Promise<void>;
    onToggleComments: (entryId: string) => Promise<void>;
    onCommentSubmit: (entryId: string) => Promise<void>;
}

const KeluhKesahEntry: React.FC<KeluhKesahEntryProps> = ({
    entry,
    entryVariants,
    index,
    votedReactions,
    expandedComments,
    commentsData,
    newCommentName,
    setNewCommentName,
    newCommentText,
    setNewCommentText,
    submittingCommentFor,
    onReactionClick,
    onToggleComments,
    onCommentSubmit,
}) => {
    const isCommentsExpanded = expandedComments[entry.id];
    const currentComments = commentsData[entry.id] || [];

    const formattedDate = entry.timestamp?.toDate ? new Date(entry.timestamp.toDate()).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Waktu tidak tersedia';

    return (
        <motion.div
            key={entry.id}
            className={`
        bg-surface1/70 backdrop-blur-sm shadow-xl rounded-xl p-5 sm:p-7 border border-surface0 flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-mauve/50
      `}
            initial="hidden"
            animate="visible"
            variants={entryVariants}
            custom={index}
        >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-mauve flex items-center gap-2 mb-2 sm:mb-0 leading-snug">
                    {entry.name}
                    <span className="text-sm text-subtext1 font-normal">berkata:</span>
                    <span className="text-xl sm:text-2xl leading-none" role="img" aria-label="emoji">{getRandomEmoji()}</span>
                </h2>
                <p className="text-xs sm:text-sm text-subtext1 opacity-80 mt-1 sm:mt-0 text-right font-light">
                    {formattedDate}
                </p>
            </div>

            {/* --- PERBAIKAN DI SINI --- */}
            {/* Tambahkan div baru untuk pesan dan pastikan Anda merender entry.message */}
            <div className="bg-surface0 rounded-lg p-4 mb-4">
                <p className="text-text font-normal leading-relaxed text-base break-words whitespace-pre-wrap">
                    {entry.message}
                </p>
            </div>
            {/* --- AKHIR PERBAIKAN --- */}

            <ReactionsPanel
                entryId={entry.id}
                entryData={entry}
                votedReactions={votedReactions}
                onReactionClick={onReactionClick}
            />
            <div className="flex justify-end items-center mt-4">
                <motion.button
                    onClick={() => onToggleComments(entry.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-sm sm:text-base text-subtext1 hover:text-lavender transition-colors font-medium opacity-80 hover:opacity-100"
                >
                    {isCommentsExpanded ? 'Sembunyikan Komentar 👆' : `Lihat/Tambah Komentar (${currentComments.length}) 👇`}
                </motion.button>
            </div>
            {isCommentsExpanded && (
                <CommentsSection
                    entryId={entry.id}
                    currentComments={currentComments}
                    isLoadingComments={false}
                    newCommentName={newCommentName}
                    setNewCommentName={setNewCommentName}
                    newCommentText={newCommentText}
                    setNewCommentText={setNewCommentText}
                    submittingCommentFor={submittingCommentFor}
                    onCommentSubmit={onCommentSubmit}
                />
            )}
        </motion.div>
    );
};

export default KeluhKesahEntry;