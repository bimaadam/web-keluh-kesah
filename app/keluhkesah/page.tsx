'use client'

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { motion } from 'framer-motion'; // Import motion dari framer-motion

interface Entry {
  id: string;
  name: string;
  message: string;
  // Tambahkan timestamp jika ada, untuk sorting di frontend jika perlu
  timestamp?: any;
}

const emotionEmojis = ['😔', '😟', '🙁', '😥', '💔', '🫠', '💭', '😢', '😞']; // Kumpulan emoji emosi

const getRandomEmoji = () => {
  return emotionEmojis[Math.floor(Math.random() * emotionEmojis.length)];
};

const KeluhKesah: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State untuk error

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'keluhkesah'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        setEntries(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry)));
        setError(null); // Reset error jika berhasil
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat keluh kesah. Coba lagi nanti ya! 😢'); // Set pesan error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-mauve mb-4 drop-shadow-md">
          Keluh Kesah Bersama 🫂
        </h1>
        <p className="text-pink text-lg max-w-xl">
          Lihat keluh kesah pengguna lain di sini, siapa tahu ada yang relatable banget sama kamu. Yuk, scroll ke bawah dan rasakan koneksinya! 👇
        </p>
      </header>

      <div className="space-y-6 w-full max-w-3xl">
        {isLoading ? (
          // Skeleton loading
          Array(3) // Kurangi jumlah skeleton agar tidak terlalu banyak
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
          // Pesan Error jika gagal mengambil data
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 text-red-300 p-4 rounded-lg text-center flex items-center justify-center gap-2"
          >
            😔 {error}
          </motion.div>
        ) : entries.length === 0 ? (
          // Tampilan jika tidak ada keluh kesah
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
              custom={index} // Jika perlu delay staggered, ini bisa digunakan
            >
              <h2 className="text-lg font-semibold text-mauve flex items-center gap-2">
                {entry.name} <span className="text-sm text-subtext1">berkata:</span>
                <span className="text-xl leading-none" role="img" aria-label="emoji">{getRandomEmoji()}</span>
              </h2>
              <p className="text-white italic">"{entry.message}"</p>
              {/* Kamu bisa menambahkan interaksi di sini, misalnya tombol reaksi */}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="self-end mt-2 text-subtext0 hover:text-yellow-400 transition-colors duration-200"
              >
                Relatable! 🔥
              </motion.button>

            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default KeluhKesah;