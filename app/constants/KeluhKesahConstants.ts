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
    relatable: { emoji: '🔥', votedEmoji: '❤️‍🔥', label: 'Relatable', color: 'bg-mauve', hoverColor: 'hover:bg-mauve/80' },
    deep: { emoji: '🤔', votedEmoji: '🧠', label: 'Deep', color: 'bg-blue', hoverColor: 'hover:bg-blue/80' },
    hugs: { emoji: '🫂', votedEmoji: '🤗', label: 'Hugs', color: 'bg-green', hoverColor: 'hover:bg-green/80' },
    laugh: { emoji: '😂', votedEmoji: '🤣', label: 'Ketawa', color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-500/80' },
    sad: { emoji: '😢', votedEmoji: '😭', label: 'Sedih', color: 'bg-sky-500', hoverColor: 'hover:bg-sky-500/80' },
    thumbUp: { emoji: '👍', votedEmoji: '👍🏽', label: 'Jempol', color: 'bg-teal-500', hoverColor: 'hover:bg-teal-500/80' },
    hugEmoji: { emoji: '🥺', votedEmoji: '🥹', label: 'Peluk', color: 'bg-pink', hoverColor: 'hover:bg-pink/80' },
};

export const emotionEmojisForRandom = ['😔', '😟', '🙁', '😥', '💔', '🫠', '💭', '😢', '😞'];
export const getRandomEmoji = () => {
    return emotionEmojisForRandom[Math.floor(Math.random() * emotionEmojisForRandom.length)];
};

export const ENTRIES_PER_PAGE = 5;