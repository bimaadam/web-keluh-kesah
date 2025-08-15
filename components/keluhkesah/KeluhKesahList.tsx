// components/keluhkesah/KeluhKesahList.tsx
'use client'

import React, { useEffect, useState, useCallback } from 'react';
import {
    collection,
    getDocs,
    query,
    orderBy,
    // Removed: startAfter, limit // Not needed for fetching all at once
    doc,
    updateDoc,
    addDoc,
    serverTimestamp,
    Query,
    DocumentData,
} from 'firebase/firestore';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { db } from '@/utils/firebase';

// Make sure this path is correct based on your project structure
import { Entry, Comment, reactions } from "app/constants/KeluhKesahConstants"; // ENTRIES_PER_PAGE is no longer needed here
import { getVotedReactions, saveVotedReactions, getExpandedComments, saveExpandedComments } from '@/utils/localStorageHelpers';

import KeluhKesahEntry from './KeluhKesahEntry';
import LoadingAndEmptyStates from './LoadingAndEmptyStates';

const KeluhKesahList: React.FC = () => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [votedReactions, setVotedReactions] = useState<{ [entryId: string]: { [reactionType: string]: boolean } }>({});
    const [expandedComments, setExpandedComments] = useState<{ [entryId: string]: boolean }>({});

    const [commentsData, setCommentsData] = useState<{ [entryId: string]: Comment[] }>({});
    const [newCommentName, setNewCommentName] = useState<string>('');
    const [newCommentText, setNewCommentText] = useState<string>('');
    const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);

    // Removed: const [lastVisible, setLastVisible] = useState<any>(null);
    // Removed: const [hasMore, setHasMore] = useState(true);
    // Removed: const [isFetchingMore, setIsFetchingMore] = useState(false);

    useEffect(() => {
        setVotedReactions(getVotedReactions());
        setExpandedComments(getExpandedComments());
    }, []);

    useEffect(() => {
        saveVotedReactions(votedReactions);
    }, [votedReactions]);

    useEffect(() => {
        saveExpandedComments(expandedComments);
    }, [expandedComments]);

    const fetchEntries = useCallback(async () => { // Removed loadMore parameter
        console.log('fetchEntries: START (Fetching all entries)');

        setIsLoading(true); // Always set loading to true when fetching

        try {
            // Simplified query: just order by timestamp, no limit or startAfter
            const entriesQuery: Query<DocumentData, DocumentData> = query(
                collection(db, 'keluhkesah'),
                orderBy('timestamp', 'desc')
            );

            console.log('fetchEntries: Executing Firestore query...');
            const querySnapshot = await getDocs(entriesQuery);
            console.log('fetchEntries: Firestore query completed. Docs:', querySnapshot.docs.length);

            const newEntries: Entry[] = [];
            querySnapshot.docs.forEach(doc => {
                const data = doc.data();
                newEntries.push({
                    id: doc.id,
                    ...data,
                    relatableCount: data.relatableCount || 0,
                    deepCount: data.deepCount || 0,
                    hugsCount: data.hugsCount || 0,
                    laughCount: data.laughCount || 0,
                    sadCount: data.sadCount || 0,
                    thumbUpCount: data.thumbUpCount || 0,
                    hugEmojiCount: data.hugEmojiCount || 0,
                } as Entry);
            });

            setEntries(newEntries); // Set all fetched entries
            setError(null);
            console.log('fetchEntries: Data entries updated. Total entries:', newEntries.length);

        } catch (err: any) {
            console.error('fetchEntries: ERROR during fetch:', err);
            setError(`Gagal memuat keluh kesah: ${err.message || 'Error tidak diketahui'}`);
        } finally {
            setIsLoading(false); // Always set loading to false after fetch attempt
            console.log('fetchEntries: END');
        }
    }, []); // Removed hasMore, lastVisible from dependencies as they are no longer used

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleReactionClick = async (entryId: string, reactionType: keyof typeof reactions) => {
        const hasVotedForThisReaction = votedReactions[entryId]?.[reactionType];

        if (hasVotedForThisReaction) {
            toast('Kamu sudah memberikan reaksi ini! 💡', {
                icon: '🚫',
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            return;
        }

        try {
            const entryRef = doc(db, 'keluhkesah', entryId);
            const currentEntry = entries.find(e => e.id === entryId);

            const countFieldName = `${reactionType}Count`;
            const count = (currentEntry as any)?.[countFieldName] || 0;
            const newCount = count + 1;

            await updateDoc(entryRef, {
                [countFieldName]: newCount
            });

            setEntries(prevEntries =>
                prevEntries.map(entry =>
                    entry.id === entryId ? { ...(entry as any), [countFieldName]: newCount } : entry
                )
            );

            setVotedReactions(prev => ({
                ...prev,
                [entryId]: {
                    ...prev[entryId],
                    [reactionType]: true
                }
            }));

            toast.success(`Kamu memberikan reaksi "${reactions[reactionType].label}"! ${reactions[reactionType].votedEmoji}`, {
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });

        } catch (error) {
            console.error(`Error updating ${reactionType} count:`, error);
            toast.error(`Gagal memberikan reaksi "${reactions[reactionType].label}". Coba lagi ya! 😔`, {
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
        }
    };

    const toggleComments = async (entryId: string) => {
        if (expandedComments[entryId]) {
            setExpandedComments(prev => ({ ...prev, [entryId]: false }));
            return;
        }

        setExpandedComments(prev => ({ ...prev, [entryId]: true }));

        if (!commentsData[entryId] || commentsData[entryId].length === 0) {
            try {
                const q = query(collection(db, 'keluhkesah', entryId, 'comments'), orderBy('timestamp', 'asc'));
                const querySnapshot = await getDocs(q);
                const comments = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Comment[];
                setCommentsData(prev => ({ ...prev, [entryId]: comments }));
            } catch (error) {
                console.error('Error fetching comments:', error);
                toast.error('Gagal memuat komentar. 😞', {
                    style: { borderRadius: '10px', background: '#333', color: '#fff' },
                });
            }
        }
    };

    const handleCommentSubmit = async (entryId: string) => {
        if (!newCommentText.trim()) {
            toast('Komentar tidak boleh kosong! ✍️', {
                icon: '⚠️',
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
            return;
        }

        setSubmittingCommentFor(entryId);

        try {
            await addDoc(collection(db, 'keluhkesah', entryId, 'comments'), {
                name: newCommentName.trim() || 'Anonim',
                comment: newCommentText.trim(),
                timestamp: serverTimestamp(),
            });

            const q = query(collection(db, 'keluhkesah', entryId, 'comments'), orderBy('timestamp', 'asc'));
            const querySnapshot = await getDocs(q);
            const updatedComments = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Comment[];

            setCommentsData(prev => ({ ...prev, [entryId]: updatedComments }));
            setNewCommentName('');
            setNewCommentText('');
            toast.success('Komentar berhasil ditambahkan! 🎉', {
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });

        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Gagal menambahkan komentar. 🥺', {
                style: { borderRadius: '10px', background: '#333', color: '#fff' },
            });
        } finally {
            setSubmittingCommentFor(null);
        }
    };

    const entryVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-base flex flex-col items-center py-12 px-4 font-sans text-subtext0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-mauve/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob lg:w-96 lg:h-96"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-pink/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 lg:w-96 lg:h-96"></div>
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-lavender/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 lg:w-96 lg:h-96"></div>

            <header className="text-center mb-10 px-2 md:px-0 z-10">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-mauve mb-3 drop-shadow-lg leading-tight tracking-wide">
                    Keluh Kesah Bersama <span className="text-lavender">🫂</span>
                </h1>
                <p className="text-pink text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed">
                    Lihat keluh kesah pengguna lain di sini, siapa tahu ada yang **relatable banget** sama kamu. Yuk, scroll ke bawah dan rasakan koneksinya!
                </p>
            </header>

            <div className="space-y-6 w-full max-w-3xl lg:max-w-4xl px-2 sm:px-0 z-10">
                {/* LoadingAndEmptyStates will correctly handle loading/error/empty states */}
                <LoadingAndEmptyStates isLoading={isLoading} error={error} entriesCount={entries.length} />

                {/* Only render entries if not loading, no error, and there are entries */}
                {!isLoading && !error && entries.length > 0 && (
                    entries.map((entry, index) => (
                        <KeluhKesahEntry
                            key={entry.id}
                            entry={entry}
                            entryVariants={entryVariants}
                            index={index}
                            votedReactions={votedReactions}
                            expandedComments={expandedComments}
                            commentsData={commentsData}
                            newCommentName={newCommentName}
                            setNewCommentName={setNewCommentName}
                            newCommentText={newCommentText}
                            setNewCommentText={setNewCommentText}
                            submittingCommentFor={submittingCommentFor}
                            onReactionClick={handleReactionClick}
                            onToggleComments={toggleComments}
                            onCommentSubmit={handleCommentSubmit}
                        />
                    ))
                )}

                {/* No "Load More" button or "hasMore" message needed */}
                {!isLoading && !error && entries.length === 0 && (
                    <div className="text-center text-subtext1 mt-8 pb-10 italic opacity-80">
                        <p>Belum ada keluh kesah. Yuk, jadi yang pertama! 🚀</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeluhKesahList;