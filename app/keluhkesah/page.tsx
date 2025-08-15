'use client'

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore'; // Import doc and updateDoc
import { db } from '../../utils/firebase';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast'; // Import toast and Toaster

interface Entry {
  id: string;
  name: string;
  message: string;
  timestamp?: any;
  relatableCount?: number; // Tambahkan field ini
}

const emotionEmojis = ['😔', '😟', '🙁', '😥', '💔', '🫠', '💭', '😢', '😞'];

const getRandomEmoji = () => {
  return emotionEmojis[Math.floor(Math.random() * emotionEmojis.length)];
};

// Fungsi helper untuk mendapatkan ID unik per sesi browser
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

const KeluhKesah: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votedEntries, setVotedEntries] = useState<Set<string>>(() => {
    // Muat dari localStorage saat inisialisasi
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('votedEntries');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'keluhkesah'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        setEntries(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          relatableCount: doc.data().relatableCount || 0 // Pastikan ada nilai default
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

  // Simpan votedEntries ke localStorage setiap kali berubah
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('votedEntries', JSON.stringify(Array.from(votedEntries)));
    }
  }, [votedEntries]);


  const handleRelatableClick = async (entryId: string) => {
    // Proteksi: cek apakah sudah pernah divote di sesi ini
    if (votedEntries.has(entryId)) {
      toast('Sudah pernah kamu anggap relatable nih! 😊', {
        icon: '💡',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    try {
      const entryRef = doc(db, 'keluhkesah', entryId);
      // Temukan entri di state untuk mendapatkan count saat ini
      const currentEntry = entries.find(e => e.id === entryId);
      const newCount = (currentEntry?.relatableCount || 0) + 1;

      // Update di Firestore
      await updateDoc(entryRef, {
        relatableCount: newCount
      });

      // Update state lokal untuk tampilan instan
      setEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.id === entryId ? { ...entry, relatableCount: newCount } : entry
        )
      );

      // Tandai entri ini sudah divote
      setVotedEntries(prev => new Set(prev).add(entryId));

      toast.success('Yeay, keluh kesah ini relatable buatmu! ❤️‍🔥', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

    } catch (error) {
      console.error('Error updating relatable count:', error);
      toast.error('Gagal memberikan relatable. Coba lagi ya! 😔', {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
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
      <Toaster /> {/* Komponen Toaster untuk menampilkan notifikasi */}

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
          entries.map((entry, index) => (
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

              <div className="flex items-center justify-end mt-2">
                <motion.button
                  onClick={() => handleRelatableClick(entry.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`flex items-center gap-1 py-1 px-3 rounded-full text-sm font-medium transition-all duration-200
                    ${votedEntries.has(entry.id) ? 'bg-mauve text-white' : 'bg-surface0 text-text hover:bg-yellow-400 hover:text-black'}`}
                >
                  {votedEntries.has(entry.id) ? (
                    <>Relatable! ❤️‍🔥</>
                  ) : (
                    <>Relatable! 🔥</>
                  )}
                  <span className="ml-1 text-sm font-bold">
                    {entry.relatableCount || 0}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default KeluhKesah;