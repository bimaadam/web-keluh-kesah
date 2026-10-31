// components/keluhkesah/ReactionsPanel.tsx
'use client';

import React from 'react';
import { Entry, reactions } from "app/constants/KeluhKesahConstants"
import { focusRing, stabilo } from '../notebook';

interface ReactionsPanelProps {
    entryId: string;
    entryData: Entry;
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
        <div role="group" aria-label="Reaksi" className="-ml-1.5 mt-3 flex flex-wrap gap-1">
            {(Object.keys(reactions) as (keyof typeof reactions)[]).map(type => {
                const reactionInfo = reactions[type];
                const count = entryData[`${type}Count`];
                const isVoted = !!entryVotedReactions[type];

                return (
                    <button
                        key={type}
                        type="button"
                        onClick={() => onReactionClick(entryId, type)}
                        aria-pressed={isVoted}
                        aria-label={`${reactionInfo.label}: ${count}`}
                        title={reactionInfo.label}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[3px] px-1.5 py-1 text-sm tabular-nums hover:bg-rule/40 aria-pressed:bg-size-[100%_85%] aria-pressed:text-on-highlight ${stabilo} ${focusRing}`}
                    >
                        <span aria-hidden="true">{isVoted ? reactionInfo.votedEmoji : reactionInfo.emoji}</span>
                        <span className={isVoted ? 'font-medium' : 'text-muted'}>{count}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ReactionsPanel;
