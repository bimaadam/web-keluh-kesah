// components/keluhkesah/KeluhKesahList.tsx
'use client'

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    collection,
    getDocs,
    query,
    orderBy,
    startAfter,
    limit,
    doc,
    setDoc,
    updateDoc,
    serverTimestamp,
    increment,
    Timestamp,
    Query,
    DocumentData,
    QueryDocumentSnapshot,
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { db } from '@/utils/firebase';

// Make sure this path is correct based on your project structure
import { Entry, Comment, reactions, ENTRIES_PER_PAGE } from "app/constants/KeluhKesahConstants";
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
    const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);

    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

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

    // Without a cursor this loads the first page; with one it appends the page after it
    const fetchEntries = useCallback(async (cursor?: QueryDocumentSnapshot<DocumentData>) => {
        if (cursor) {
            setIsFetchingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            // One extra entry is requested only to know whether another page exists
            const entriesQuery: Query<DocumentData, DocumentData> = query(
                collection(db, 'keluhkesah'),
                orderBy('timestamp', 'desc'),
                ...(cursor ? [startAfter(cursor)] : []),
                limit(ENTRIES_PER_PAGE + 1)
            );

            const querySnapshot = await getDocs(entriesQuery);
            const pageDocs = querySnapshot.docs.slice(0, ENTRIES_PER_PAGE);

            const newEntries: Entry[] = [];
            pageDocs.forEach(doc => {
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

            setEntries(prevEntries => cursor ? [...prevEntries, ...newEntries] : newEntries);
            setLastVisible(pageDocs[pageDocs.length - 1] ?? null);
            setHasMore(querySnapshot.docs.length > ENTRIES_PER_PAGE);
            setError(null);

        } catch (err: any) {
            console.error('fetchEntries: ERROR during fetch:', err);
            if (cursor) {
                // Keep the entries already shown; only report that the next page failed
                toast.error('Tulisan yang lebih lama gagal dimuat. Coba lagi.');
            } else {
                setError(err.message || 'Error tidak diketahui');
            }
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const fetchComments = async (entryId: string) => {
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
            toast.error('Komentar gagal dimuat. Tutup lalu buka lagi untuk mencoba ulang.');
        }
    };

    // Expanded sections are restored from localStorage, so load comments for expanded entries
    // as they arrive (first page or "load more") unless they've already been fetched
    useEffect(() => {
        entries.forEach(entry => {
            if (expandedComments[entry.id] && !commentsData[entry.id]) fetchComments(entry.id);
        });
    }, [entries]);

    const handleReactionClick = async (entryId: string, reactionType: keyof typeof reactions) => {
        const hasVotedForThisReaction = votedReactions[entryId]?.[reactionType];

        if (hasVotedForThisReaction) {
            toast('Kamu sudah kasih reaksi ini.');
            return;
        }

        // Mark as voted before the request so a quick double click can't increment twice.
        // The highlighter on the button is the confirmation, so success shows no toast.
        setVotedReactions(prev => ({
            ...prev,
            [entryId]: {
                ...prev[entryId],
                [reactionType]: true
            }
        }));

        try {
            const entryRef = doc(db, 'keluhkesah', entryId);
            const countFieldName = `${reactionType}Count` as const;

            // increment() is applied on the server, so concurrent reactions from other users aren't overwritten
            await updateDoc(entryRef, {
                [countFieldName]: increment(1)
            });

            setEntries(prevEntries =>
                prevEntries.map(entry =>
                    entry.id === entryId ? { ...entry, [countFieldName]: entry[countFieldName] + 1 } : entry
                )
            );

        } catch (error) {
            console.error(`Error updating ${reactionType} count:`, error);
            setVotedReactions(prev => ({
                ...prev,
                [entryId]: {
                    ...prev[entryId],
                    [reactionType]: false
                }
            }));
            toast.error(`Reaksi "${reactions[reactionType].label}" gagal ditambahkan. Coba lagi.`);
        }
    };

    const toggleComments = async (entryId: string) => {
        if (expandedComments[entryId]) {
            setExpandedComments(prev => ({ ...prev, [entryId]: false }));
            return;
        }

        setExpandedComments(prev => ({ ...prev, [entryId]: true }));

        if (!commentsData[entryId] || commentsData[entryId].length === 0) {
            await fetchComments(entryId);
        }
    };

    // Returns true when the comment was saved, so the caller can clear its inputs
    const handleCommentSubmit = async (entryId: string, name: string, text: string) => {
        if (!text.trim()) {
            toast.error('Komentarnya masih kosong.');
            return false;
        }

        setSubmittingCommentFor(entryId);

        // The id is generated up front so the comment can be shown immediately and removed again if saving fails
        const commentRef = doc(collection(db, 'keluhkesah', entryId, 'comments'));
        const newComment: Comment = {
            id: commentRef.id,
            name: name.trim() || 'Anonim',
            comment: text.trim(),
            timestamp: Timestamp.now(),
        };
        setCommentsData(prev => ({ ...prev, [entryId]: [...(prev[entryId] || []), newComment] }));

        try {
            await setDoc(commentRef, {
                name: newComment.name,
                comment: newComment.comment,
                timestamp: serverTimestamp(),
            });

            toast.success('Komentar terkirim.');
            return true;

        } catch (error) {
            console.error('Error adding comment:', error);
            setCommentsData(prev => ({
                ...prev,
                [entryId]: (prev[entryId] || []).filter(comment => comment.id !== newComment.id)
            }));
            toast.error('Komentar gagal dikirim. Coba lagi.');
            return false;
        } finally {
            setSubmittingCommentFor(null);
        }
    };

    return (
        <section className="pt-line pb-[calc(var(--line)*2)]">
            <div className="nb-row">
                <div className="nb-margin" />
                <header className="nb-body flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
                    <div className="max-w-[34rem]">
                        <h1 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">Keluh kesah orang-orang</h1>
                        <p className="mt-2 text-muted">
                            Yang terbaru ada di atas. Kalau ada yang relate, kasih reaksi atau tinggalin komentar.
                        </p>
                    </div>
                    <Link href="/isiform" className="btn-quiet">Tulis punyamu</Link>
                </header>
            </div>

            <div className="mt-[calc(var(--line)*1.5)]">
                {/* Handles the loading, error, and empty states */}
                <LoadingAndEmptyStates isLoading={isLoading} error={error} entriesCount={entries.length} />

                {!isLoading && !error && entries.map(entry => (
                    <KeluhKesahEntry
                        key={entry.id}
                        entry={entry}
                        votedReactions={votedReactions}
                        expandedComments={expandedComments}
                        commentsData={commentsData}
                        submittingCommentFor={submittingCommentFor}
                        onReactionClick={handleReactionClick}
                        onToggleComments={toggleComments}
                        onCommentSubmit={handleCommentSubmit}
                    />
                ))}

                {!isLoading && !error && hasMore && (
                    <div className="nb-row">
                        <div className="nb-margin" />
                        <div className="nb-body">
                            <button
                                type="button"
                                onClick={() => lastVisible && fetchEntries(lastVisible)}
                                disabled={isFetchingMore}
                                className="btn-quiet"
                            >
                                {isFetchingMore ? 'Memuat…' : 'Tampilkan yang lebih lama'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default KeluhKesahList;
