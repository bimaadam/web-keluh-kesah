// components/keluhkesah/ReactionsPanel.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { reactions } from "app/constants/KeluhKesahConstants"

interface ReactionsPanelProps {
    entryId: string;
    entryData: { [key: string]: any };
    votedReactions: { [entryId: string]: { [reactionType: string]: boolean } };
    onReactionClick: (entryId: string, reactionType: keyof typeof reactions) => Promise<void>;
}

const ReactionsPanel: React.FC<ReactionsPanelProps> = ({
    entryId,
    entryData,
    votedReactions,
    onReactionClick,
}) => {
    const entryVotedReactions = votedReactions[entryId] || {};

    return (
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 mt-auto pt-4 border-t border-surface0/50">
            {Object.entries(reactions).map(([type, reactionInfo]) => {
                const count = entryData[`${type}Count`] || 0;
                const isVoted = entryVotedReactions[type];

                return (
                    <motion.button
                        key={type}
                        onClick={() => onReactionClick(entryId, type as keyof typeof reactions)}
                        whileHover={{ scale: 1.1, boxShadow: '0 0 10px rgba(var(--color-mauve-rgb), 0.5)' }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center gap-1 py-1 px-2 sm:px-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-200
              ${isVoted ? reactionInfo.color + ' text-white shadow-md' : 'bg-surface0 text-text hover:text-black ' + reactionInfo.hoverColor}`}
                    >
                        {isVoted ? reactionInfo.votedEmoji : reactionInfo.emoji}
                        <span className="ml-0.5 sm:ml-1 text-xs sm:text-sm font-bold opacity-90">
                            {count}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default ReactionsPanel;