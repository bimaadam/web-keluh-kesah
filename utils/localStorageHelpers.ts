// utils/localStorageHelpers.ts

import { reactions } from "app/constants/KeluhKesahConstants"

export const getVotedReactions = () => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('votedReactions');
    return saved ? JSON.parse(saved) : {};
};

export const saveVotedReactions = (voted: { [entryId: string]: { [reactionType: string]: boolean } }) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('votedReactions', JSON.stringify(voted));
    }
};

export const getExpandedComments = () => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('expandedComments');
    return saved ? JSON.parse(saved) : {};
};

export const saveExpandedComments = (expanded: { [entryId: string]: boolean }) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('expandedComments', JSON.stringify(expanded));
    }
};