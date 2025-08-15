'use client'

import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  addDoc, // Untuk menambah komentar
  serverTimestamp // Untuk timestamp komentar
} from 'firebase/firestore';
import { db } from '../../utils/firebase'; // Pastikan db diimpor
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import { toast, Toaster } from 'react-hot-toast';

// --- Definisi Tipe dan Konstan ---

interface Entry {
  id: string;
  name: string;
  message: string;
  timestamp?: any;
  // Reaksi Lama
  relatableCount?: number;
  deepCount?: number;
  hugsCount?: number;
  // Reaksi Baru
  laughCount?: number; // Reaksi: Ketawa
  sadCount?: number;   // Reaksi: Sedih
  thumbUpCount?: number; // Reaksi: Jempol
  hugEmojiCount?: number; // Reaksi: Peluk (Nama berbeda agar tidak bentrok dengan hugsCount lama)
}

interface Comment {
  id: string;
  name: string;
  comment: string;
  timestamp: any;
}

// Objek untuk menyimpan detail reaksi
const reactions = {
  relatable: {
    emoji: '🔥',
    votedEmoji: '❤️‍🔥',
    label: 'Relatable',
    color: 'bg-mauve',
    hoverColor: 'hover:bg-mauve/80'
  },
  deep: {
    emoji: '🤔',
    votedEmoji: '🧠',
    label: 'Deep',
    color: 'bg-blue',
    hoverColor: 'hover:bg-blue/80'
  },
  hugs: {
    emoji: '🫂',
    votedEmoji: '🤗',
    label: 'Hugs',
    color: 'bg-green',
    hoverColor: 'hover:bg-green/80'
  },
  laugh: { // Reaksi baru: Ketawa
    emoji: '😂',
    votedEmoji: '🤣',
    label: 'Ketawa',
    color: 'bg-yellow-500', // Warna baru
    hoverColor: 'hover:bg-yellow-500/80'
  },
  sad: { // Reaksi baru: Sedih
    emoji: '😢',
    votedEmoji: '😭',
    label: 'Sedih',
    color: 'bg-sky-500', // Warna baru
    hoverColor: 'hover:bg-sky-500/80'
  },
  thumbUp: { // Reaksi baru: Jempol
    emoji: '👍',
    votedEmoji: '👍🏽',
    label: 'Jempol',
    color: 'bg-teal-500', // Warna baru
    hoverColor: 'hover:bg-teal-500/80'
  },
  hugEmoji: { // Reaksi baru: Peluk (diubah namanya agar tidak bentrok dengan 'hugs')
    emoji: '🥺',
    votedEmoji: '🥹',
    label: 'Peluk',
    color: 'bg-pink', // Warna baru
    hoverColor: 'hover:bg-pink/80'
  },
};

const emotionEmojisForRandom = ['😔', '😟', '🙁', '😥', '💔', '🫠', '💭', '😢', '😞'];
const getRandomEmoji = () => {
  return emotionEmojisForRandom[Math.floor(Math.random() * emotionEmojisForRandom.length)];
};

// --- Helper untuk localStorage (melacak reaksi & komentar per entri) ---

// Melacak reaksi: { "entryId": { "reactionType1": true, "reactionType2": false }, ... }
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

// Melacak status expand komentar: { "entryId": true/false, ... }
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
  const [commentsData, setCommentsData] = useState<{ [entryId: string]: Comment[] }>({}); // Untuk menyimpan komentar per entri

  // State untuk form komentar
  const [newCommentName, setNewCommentName] = useState<string>('');
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [submittingCommentFor, setSubmittingCommentFor] = useState<string | null>(null); // Entry ID yang sedang disubmit komentarnya


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
          // Inisialisasi reaksi baru
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

  // Simpan votedReactions ke localStorage setiap kali berubah
  useEffect(() => {
    saveVotedReactions(votedReactions);
  }, [votedReactions]);

  // Simpan expandedComments ke localStorage setiap kali berubah
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

      // Pastikan properti count ada (misal: 'relatableCount')
      const countFieldName = `${reactionType}Count`;
      // Handle cases where the field name might slightly differ (e.g., 'hugEmoji' vs 'hugs')
      const count = (currentEntry as any)?.[countFieldName] || 0; // Use 'any' for dynamic access
      const newCount = count + 1;

      // Update di Firestore
      await updateDoc(entryRef, {
        [countFieldName]: newCount
      });

      // Update state lokal untuk tampilan instan
      setEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.id === entryId ? { ...(entry as any), [countFieldName]: newCount } : entry
        )
      );

      // Tandai reaksi ini sudah divote
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
    // Jika komentar sudah diekspansi, tutup saja
    if (expandedComments[entryId]) {
      setExpandedComments(prev => ({ ...prev, [entryId]: false }));
      return;
    }

    // Jika belum diekspansi, buka dan muat komentarnya
    setExpandedComments(prev => ({ ...prev, [entryId]: true }));

    // Hanya muat komentar jika belum ada atau perlu refresh
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

    setSubmittingCommentFor(entryId); // Set loading state for this entry's comment form

    try {
      await addDoc(collection(db, 'keluhkesah', entryId, 'comments'), {
        name: newCommentName || 'Anonim', // Default to Anonim if name is empty
        comment: newCommentText,
        timestamp: serverTimestamp(), // Use serverTimestamp for consistency
      });

      // Fetch comments again to update the list immediately
      const q = query(collection(db, 'keluhkesah', entryId, 'comments'), orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      const updatedComments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];

      setCommentsData(prev => ({ ...prev, [entryId]: updatedComments }));
      setNewCommentName(''); // Clear form
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
      setSubmittingCommentFor(null); // Reset loading state
    }
  };


  // Varian untuk animasi kemunculan entri
  const entryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  // Varian untuk animasi komentar (muncul/hilang)
  const commentSectionVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeOut" } }
  };

  const commentItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };


  return (
    <div className="min-h-screen bg-base flex flex-col items-center py-8 px-4">
      <Toaster />

      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-mauve mb-4 drop-shadow-md">
          Keluh Kesah Bersama 🫂
        </h1>
        <p className="text-pink text-lg max-w-xl">
          Lihat keluh kesah pengguna lain di sini, siapa tahu ada yang **relatable banget** sama kamu. Yuk, scroll ke bawah dan rasakan koneksinya! 👇
        </p>
      </header>

      <div className="space-y-6 w-full max-w-3xl">
        {isLoading ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-surface1 rounded-lg h-36 w-full shadow-md p-6 flex flex-col justify-between"
              >
                <div className="h-5 bg-gray-400 rounded w-2/5 mb-3"></div>
                <div className="h-4 bg-gray-400 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-400 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-500 rounded w-1/2 self-end"></div>
              </div>
            ))
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 text-red-300 p-4 rounded-lg text-center flex items-center justify-center gap-2"
          >
            😔 {error}
          </motion.div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface1 text-subtext0 p-6 rounded-lg text-center shadow-md border-l-4 border-yellow-500"
          >
            <p className="text-2xl mb-2">Belum ada keluh kesah nih... 🤫</p>
            <p className="text-lg">
              Mungkin kamu bisa jadi yang pertama berbagi? Tekan tombol "Mulai Keluh Kesah" di halaman utama ya! ✨
            </p>
          </motion.div>
        ) : (
          entries.map((entry, index) => {
            const entryVotedReactions = votedReactions[entry.id] || {};
            const isCommentsExpanded = expandedComments[entry.id];
            const currentComments = commentsData[entry.id] || [];

            return (
              <motion.div
                key={entry.id}
                className="bg-surface1 shadow-md rounded-lg p-6 border-l-4 border-lavender flex flex-col gap-2"
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <h2 className="text-lg font-semibold text-mauve flex items-center gap-2">
                  {entry.name} <span className="text-sm text-subtext1">berkata:</span>
                  <span className="text-xl leading-none" role="img" aria-label="emoji">{getRandomEmoji()}</span>
                </h2>
                <p className="text-white italic">"{entry.message}"</p>

                {/* Bagian Reaksi */}
                <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-surface0">
                  {Object.entries(reactions).map(([type, reactionInfo]) => {
                    const count = (entry as any)[`${type}Count`] || 0; // Access count dynamically
                    const isVoted = entryVotedReactions[type];

                    return (
                      <motion.button
                        key={type}
                        onClick={() => handleReactionClick(entry.id, type as keyof typeof reactions)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center gap-1 py-1 px-3 rounded-full text-xs font-medium transition-all duration-200
                          ${isVoted ? reactionInfo.color + ' text-white' : 'bg-surface0 text-text hover:text-black ' + reactionInfo.hoverColor}`}
                      >
                        {isVoted ? reactionInfo.votedEmoji : reactionInfo.emoji}
                        <span className="ml-1 text-xs font-bold">
                          {count}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Tombol Komentar */}
                <div className="flex justify-end mt-2">
                  <motion.button
                    onClick={() => toggleComments(entry.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-sm text-subtext1 hover:text-lavender transition-colors"
                  >
                    {isCommentsExpanded ? 'Sembunyikan Komentar 👆' : 'Lihat/Tambah Komentar 👇'}
                  </motion.button>
                </div>

                {/* Bagian Komentar (animasi dengan AnimatePresence) */}
                <AnimatePresence>
                  {isCommentsExpanded && (
                    <motion.div
                      key="comments-section" // Key is important for AnimatePresence
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="mt-4 pt-4 border-t border-surface0 space-y-3"
                    >
                      {currentComments.length === 0 ? (
                        <p className="text-sm text-subtext1 text-center italic">
                          Belum ada komentar di sini. Jadilah yang pertama! 💬
                        </p>
                      ) : (
                        currentComments.map((comment, commentIndex) => (
                          <motion.div
                            key={comment.id}
                            variants={commentItemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: commentIndex * 0.05 }} // Stagger comments
                            className="bg-surface0 p-3 rounded-lg border border-surface1"
                          >
                            <p className="text-sm font-semibold text-text">
                              {comment.name} <span className="text-xs text-subtext1">mengomentari:</span>
                            </p>
                            <p className="text-sm text-white italic">"{comment.comment}"</p>
                            <p className="text-xs text-subtext1 mt-1 text-right">
                              {new Date(comment.timestamp?.toDate()).toLocaleString()}
                            </p>
                          </motion.div>
                        ))
                      )}

                      {/* Form Tambah Komentar */}
                      <div className="mt-4 p-4 bg-surface0 rounded-lg border border-surface1">
                        <h3 className="text-md font-semibold text-mauve mb-3">Tambah Komentar Baru:</h3>
                        <input
                          type="text"
                          placeholder="Nama kamu (opsional)"
                          value={newCommentName}
                          onChange={(e) => setNewCommentName(e.target.value)}
                          className="w-full p-2 mb-2 rounded-lg bg-base text-white focus:outline-none focus:ring-1 focus:ring-lavender placeholder-subtext1 text-sm"
                          maxLength={30}
                        />
                        <textarea
                          placeholder="Ketik komentar di sini..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="w-full p-2 rounded-lg bg-base text-white focus:outline-none focus:ring-1 focus:ring-lavender resize-y min-h-[60px] max-h-[150px] placeholder-subtext1 text-sm"
                          rows={3}
                          maxLength={200}
                          required
                        ></textarea>
                        <p className="text-right text-xs text-subtext1 mt-1">
                          {newCommentText.length} / 200 karakter
                        </p>
                        <motion.button
                          onClick={() => handleCommentSubmit(entry.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`mt-3 w-full py-2 px-4 rounded-lg font-bold text-white transition duration-300 flex items-center justify-center gap-2
                            ${submittingCommentFor === entry.id ? 'bg-mauve/70 cursor-not-allowed' : 'bg-lavender hover:bg-pink'}`}
                          disabled={submittingCommentFor === entry.id}
                        >
                          {submittingCommentFor === entry.id ? (
                            <>Mengirim... 🌀</>
                          ) : (
                            <>Kirim Komentar 🎉</>
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