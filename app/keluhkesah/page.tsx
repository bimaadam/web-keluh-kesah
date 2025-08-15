'use client'

import React, { useEffect, useState, useRef } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { db } from '@/utils/firebase';


// --- Definisi Tipe dan Konstan ---

interface Entry {
  id: string;
  name: string;
  message: string;
  timestamp?: any;
  relatableCount?: number;
  deepCount?: number;
  hugsCount?: number;
  laughCount?: number;
  sadCount?: number;
  thumbUpCount?: number;
  hugEmojiCount?: number;
}

interface Comment {
  id: string;
  name: string;
  comment: string;
  timestamp: any;
}

const reactions = {
  relatable: { emoji: '🔥', votedEmoji: '❤️‍🔥', label: 'Relatable', color: 'bg-mauve', hoverColor: 'hover:bg-mauve/80' },
  deep: { emoji: '🤔', votedEmoji: '🧠', label: 'Deep', color: 'bg-blue', hoverColor: 'hover:bg-blue/80' },
  hugs: { emoji: '🫂', votedEmoji: '🤗', label: 'Hugs', color: 'bg-green', hoverColor: 'hover:bg-green/80' },
  laugh: { emoji: '😂', votedEmoji: '🤣', label: 'Ketawa', color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-500/80' },
  sad: { emoji: '😢', votedEmoji: '😭', label: 'Sedih', color: 'bg-sky-500', hoverColor: 'hover:bg-sky-500/80' },
  thumbUp: { emoji: '👍', votedEmoji: '👍🏽', label: 'Jempol', color: 'bg-teal-500', hoverColor: 'hover:bg-teal-500/80' },
  hugEmoji: { emoji: '🥺', votedEmoji: '🥹', label: 'Peluk', color: 'bg-pink', hoverColor: 'hover:bg-pink/80' },
};

const emotionEmojisForRandom = ['😔', '😟', '🙁', '😥', '💔', '🫠', '💭', '😢', '😞'];
const getRandomEmoji = () => {
  return emotionEmojisForRandom[Math.floor(Math.random() * emotionEmojisForRandom.length)];
};

// --- Helper untuk localStorage ---
const getVotedReactions = () => {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem('votedReactions');
  return saved ? JSON.parse(saved) : {};
};
const saveVotedReactions = (voted: { [entryId: string]: { [reactionType: string]: boolean } }) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('votedReactions', JSON.stringify(voted));
  }
};

const getExpandedComments = () => {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem('expandedComments');
  return saved ? JSON.parse(saved) : {};
};
const saveExpandedComments = (expanded: { [entryId: string]: boolean }) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('expandedComments', JSON.stringify(expanded));
  }
};

// --- Komponen KeluhKesah ---

const KeluhKesah: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votedReactions, setVotedReactions] = useState<{ [entryId: string]: { [reactionType: string]: boolean } }>(getVotedReactions);
  const [expandedComments, setExpandedComments] = useState<{ [entryId: string]: boolean }>(getExpandedComments);
  const [commentsData, setCommentsData] = useState<{ [entryId: string]: Comment[] }>({});

  const [newCommentName, setNewCommentName] = useState<string>('');
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null);

  // useRef ini tidak lagi digunakan untuk fitur bagikan gambar, tapi tetap bisa ada jika dibutuhkan di masa depan.
  // Jika tidak ada kebutuhan lain, bisa dihapus. Untuk saat ini, saya biarkan saja.
  const entryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'keluhkesah'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        setEntries(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          relatableCount: doc.data().relatableCount || 0,
          deepCount: doc.data().deepCount || 0,
          hugsCount: doc.data().hugsCount || 0,
          laughCount: doc.data().laughCount || 0,
          sadCount: doc.data().sadCount || 0,
          thumbUpCount: doc.data().thumbUpCount || 0,
          hugEmojiCount: doc.data().hugEmojiCount || 0,
        } as Entry)));
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat keluh kesah. Coba lagi nanti ya! 😢');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    saveVotedReactions(votedReactions);
  }, [votedReactions]);

  useEffect(() => {
    saveExpandedComments(expandedComments);
  }, [expandedComments]);

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

  const commentSectionVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeOut" } },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.4, ease: "easeOut" } },
  };

  const commentItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-base flex flex-col items-center py-12 px-4 font-sans text-subtext0 relative overflow-hidden">
      <Toaster />

      {/* Background blobs/shapes for aesthetic */}
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
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-surface1/70 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-surface0 h-52 sm:h-56 flex flex-col justify-between"
              >
                <div className="h-7 bg-gray-600 rounded-lg w-2/5 mb-4"></div>
                <div className="h-5 bg-gray-500 rounded-lg w-full mb-3"></div>
                <div className="h-5 bg-gray-500 rounded-lg w-3/4 mb-5"></div>
                <div className="flex justify-end gap-3 mt-auto">
                  <div className="h-9 w-24 bg-gray-700 rounded-full"></div>
                  <div className="h-9 w-24 bg-gray-700 rounded-full"></div>
                  <div className="h-9 w-24 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            ))
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/30 text-red-300 p-6 rounded-lg text-center flex items-center justify-center gap-2 border border-red-400/50"
          >
            😔 {error}
          </motion.div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface1/70 backdrop-blur-sm text-subtext0 p-8 rounded-xl text-center shadow-xl border border-surface0"
          >
            <p className="text-xl sm:text-2xl mb-3 font-semibold text-lavender">Belum ada keluh kesah nih... 🤫</p>
            <p className="text-base sm:text-lg text-subtext0 leading-relaxed">
              Mungkin kamu bisa jadi yang pertama berbagi? Tekan tombol "Mulai Keluh Kesah" di halaman utama ya! ✨
            </p>
          </motion.div>
        ) : (
          entries.map((entry, index) => {
            const entryVotedReactions = votedReactions[entry.id] || {};
            const isCommentsExpanded = expandedComments[entry.id];
            const currentComments = commentsData[entry.id] || [];

            const formattedDate = entry.timestamp?.toDate ? new Date(entry.timestamp.toDate()).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'Waktu tidak tersedia';

            return (
              <motion.div
                key={entry.id}
                // Ref `entryRefs` dihapus karena tidak lagi digunakan untuk fitur bagikan gambar.
                className={`
                  bg-surface1/70 backdrop-blur-sm shadow-xl rounded-xl p-5 sm:p-7 border border-surface0 flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-mauve/50
                `}
                initial="hidden"
                animate="visible"
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
                <p className="text-white text-base sm:text-lg italic leading-relaxed mb-5">"{entry.message}"</p>

                {/* Bagian Reaksi */}
                <div className={`
                  flex flex-wrap items-center justify-end gap-2 sm:gap-3 mt-auto pt-4 border-t border-surface0/50
                `}>
                  {Object.entries(reactions).map(([type, reactionInfo]) => {
                    const count = (entry as any)[`${type}Count`] || 0;
                    const isVoted = entryVotedReactions[type];

                    return (
                      <motion.button
                        key={type}
                        onClick={() => handleReactionClick(entry.id, type as keyof typeof reactions)}
                        whileHover={{ scale: 1.1, boxShadow: "0 0 10px rgba(var(--color-mauve-rgb), 0.5)" }}
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

                {/* Tombol Komentar saja (Tombol Bagikan Gambar telah dihapus) */}
                <div className={`flex justify-end items-center mt-4`}> {/* Hanya justify-end */}
                  <motion.button
                    onClick={() => toggleComments(entry.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-sm sm:text-base text-subtext1 hover:text-lavender transition-colors font-medium opacity-80 hover:opacity-100"
                  >
                    {isCommentsExpanded ? 'Sembunyikan Komentar 👆' : `Lihat/Tambah Komentar (${currentComments.length}) 👇`}
                  </motion.button>
                </div>

                {/* Watermark khusus untuk mode capture dihapus karena fitur telah dihapus */}
                {/* <div className={`absolute bottom-2 right-2 text-mauve text-xs opacity-70 font-semibold tracking-wider ${capturingEntryId === entry.id ? 'block' : 'hidden'}`}>
                  KeluhKesahBersama.com
                </div> */}


                {/* Bagian Komentar (animasi dengan AnimatePresence) */}
                <AnimatePresence>
                  {isCommentsExpanded && (
                    <motion.div
                      key="comments-section"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="mt-5 pt-5 border-t border-surface0/50 space-y-4"
                    >
                      {currentComments.length === 0 && !isLoading ? (
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

                      {/* Form Tambah Komentar */}
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
                          onClick={() => handleCommentSubmit(entry.id)}
                          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(var(--color-pink-rgb), 0.7)" }}
                          whileTap={{ scale: 0.95 }}
                          className={`mt-4 w-full py-2.5 px-4 rounded-lg font-bold text-white transition duration-300 flex items-center justify-center gap-2 text-base sm:text-lg
                            ${submittingCommentFor === entry.id ? 'bg-mauve/60 cursor-not-allowed' : 'bg-lavender hover:bg-pink hover:shadow-lg'}`}
                          disabled={submittingCommentFor === entry.id}
                        >
                          {submittingCommentFor === entry.id ? (
                            <>Mengirim... <span className="animate-spin">🌀</span></>
                          ) : (
                            <>Kirim Komentar <span className="text-xl">🎉</span></>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default KeluhKesah;