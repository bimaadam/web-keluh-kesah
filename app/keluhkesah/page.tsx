'use client'

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

// --- Definisi Tipe dan Konstan ---

interface Entry {
  id: string;
  name: string;
  message: string;
  timestamp?: any;
  relatableCount?: number;
  deepCount?: number; // Tambahkan field baru
  hugsCount?: number; // Tambahkan field baru
}

// Objek untuk menyimpan detail reaksi
const reactions = {
  relatable: {
    emoji: '🔥',
    votedEmoji: '❤️‍🔥',
    label: 'Relatable!',
    color: 'bg-mauve', // Tailwind color for voted state
    hoverColor: 'hover:bg-yellow-400' // Tailwind color for hover (unvoted)
  },
  deep: {
    emoji: ' pondering_face ', // Emoji untuk Deep
    votedEmoji: '🧠',
    label: 'Deep...',
    color: 'bg-blue',
    hoverColor: 'hover:bg-sky-400'
  },
  hugs: {
    emoji: '🫂', // Emoji untuk Hugs
    votedEmoji: '🤗',
    label: 'Hugs!',
    color: 'bg-green',
    hoverColor: 'hover:bg-emerald-400'
  },
};

const emotionEmojis = ['😔', '😟', '🙁', '😥', '💔', '🫠', '💭', '😢', '😞'];

const getRandomEmoji = () => {
  return emotionEmojis[Math.floor(Math.random() * emotionEmojis.length)];
};

// Fungsi helper untuk melacak vote per entri dan per jenis reaksi
// Structure: { "entryId": { "relatable": true, "deep": false, "hugs": true }, ... }
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

// --- Komponen KeluhKesah ---

const KeluhKesah: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votedReactions, setVotedReactions] = useState<{ [entryId: string]: { [reactionType: string]: boolean } }>(getVotedReactions);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'keluhkesah'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        setEntries(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          relatableCount: doc.data().relatableCount || 0,
          deepCount: doc.data().deepCount || 0, // Inisialisasi
          hugsCount: doc.data().hugsCount || 0,   // Inisialisasi
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


  const handleReactionClick = async (entryId: string, reactionType: 'relatable' | 'deep' | 'hugs') => {
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

      // Pastikan properti count ada
      const currentCount = currentEntry?.[`${reactionType}Count`] || 0;
      const newCount = currentCount + 1;

      // Update di Firestore
      await updateDoc(entryRef, {
        [`${reactionType}Count`]: newCount // Gunakan computed property name
      });

      // Update state lokal untuk tampilan instan
      setEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.id === entryId ? { ...entry, [`${reactionType}Count`]: newCount } : entry
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

      toast.success(`Kamu memberikan reaksi ${reactions[reactionType].label}! ${reactions[reactionType].votedEmoji}`, {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });

    } catch (error) {
      console.error(`Error updating ${reactionType} count:`, error);
      toast.error(`Gagal memberikan reaksi ${reactions[reactionType].label}. Coba lagi ya! 😔`, {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
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
                className="animate-pulse bg-surface1 rounded-lg h-28 w-full shadow-md p-6 flex flex-col justify-between"
              >
                <div className="h-5 bg-gray-400 rounded w-2/5 mb-3"></div>
                <div className="h-4 bg-gray-400 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-400 rounded w-3/4"></div>
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
            const entryVotedReactions = votedReactions[entry.id] || {}; // Get reactions for this entry

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

                <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-surface0"> {/* Container tombol reaksi */}
                  {Object.entries(reactions).map(([type, reactionInfo]) => {
                    const count = entry[`${type}Count` as keyof Entry] || 0; // Access count dynamically
                    const isVoted = entryVotedReactions[type];

                    return (
                      <motion.button
                        key={type}
                        onClick={() => handleReactionClick(entry.id, type as 'relatable' | 'deep' | 'hugs')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex items-center gap-1 py-1 px-3 rounded-full text-sm font-medium transition-all duration-200
                          ${isVoted ? reactionInfo.color + ' text-white' : 'bg-surface0 text-text ' + reactionInfo.hoverColor + ' hover:text-black'}`}
                      >
                        {isVoted ? reactionInfo.votedEmoji : reactionInfo.emoji}
                        <span className="ml-1 text-sm font-bold">
                          {count}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default KeluhKesah;