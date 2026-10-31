// src/constants/keluhKesahConstants.ts

export interface Entry {
    id: string;
    name: string;
    message: string;
    timestamp?: any;
    relatableCount: number;
    deepCount: number;
    hugsCount: number;
    laughCount: number;
    sadCount: number;
    thumbUpCount: number;
    hugEmojiCount: number;
}

export interface Comment {
    id: string;
    name: string;
    comment: string;
    timestamp: any;
}

export const reactions = {
    relatable: { emoji: '🔥', votedEmoji: '❤️‍🔥', label: 'Relatable' },
    deep: { emoji: '🤔', votedEmoji: '🧠', label: 'Deep' },
    hugs: { emoji: '🫂', votedEmoji: '🤗', label: 'Hugs' },
    laugh: { emoji: '😂', votedEmoji: '🤣', label: 'Ketawa' },
    sad: { emoji: '😢', votedEmoji: '😭', label: 'Sedih' },
    thumbUp: { emoji: '👍', votedEmoji: '👍🏽', label: 'Jempol' },
    hugEmoji: { emoji: '🥺', votedEmoji: '🥹', label: 'Peluk' },
};

export const ENTRIES_PER_PAGE = 10;