'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import serverTimestamp
import { db } from '../../utils/firebase';
import { motion } from 'framer-motion'; // Import motion dari framer-motion
import { toast, Toaster } from 'react-hot-toast'; // Import react-hot-toast

// Instal ini jika belum: npm install react-hot-toast

const IsiForm: React.FC = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading tombol
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Mulai loading

    try {
      await addDoc(collection(db, 'keluhkesah'), {
        name,
        message,
        timestamp: serverTimestamp(), // Gunakan serverTimestamp untuk konsistensi waktu
      });
      toast.success('Keluh kesahmu berhasil tersimpan! 😌'); // Notifikasi sukses
      setName(''); // Kosongkan form
      setMessage('');
      // Delay sedikit sebelum navigasi agar notifikasi terlihat
      setTimeout(() => {
        router.push('/keluhkesah');
      }, 1500); // Navigasi setelah 1.5 detik
    } catch (error) {
      console.error('Error submitting keluh kesah:', error);
      toast.error('Gagal menyimpan keluh kesah. Coba lagi ya! 😥'); // Notifikasi error
    } finally {
      setIsSubmitting(false); // Selesai loading
    }
  };

  // Varian untuk animasi form container
  const formContainerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  // Varian untuk animasi tombol
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    loading: { scale: 1, opacity: 0.7, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-mantle flex items-center justify-center px-4">
      <Toaster /> {/* Komponen Toaster untuk menampilkan notifikasi */}

      <motion.div
        className="bg-base text-white shadow-lg rounded-lg p-8 max-w-md w-full border border-surface0"
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-mauve drop-shadow-md">
          Curahkan Isi Hatimu... 📝
        </h1>
        <p className="text-center text-subtext0 mb-6">
          Jangan ragu untuk berbagi apa yang sedang kamu rasakan. Kami siap mendengarkan. 😊
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-text">Nama (Opsional)</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-surface0 text-white focus:outline-none focus:ring-2 focus:ring-lavender placeholder-subtext1"
              placeholder="Misal: Hamba Allah, Anonim, atau Namamu"
              maxLength={50} // Batasi panjang nama
            />
          </div>
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium mb-2 text-text">Pesan Keluh Kesahmu</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-lg bg-surface0 text-white focus:outline-none focus:ring-2 focus:ring-lavender resize-y min-h-[120px] max-h-[300px] placeholder-subtext1"
              rows={5}
              placeholder="Tuliskan semua keluh kesahmu di sini..."
              required
              maxLength={500} // Batasi panjang pesan
            ></textarea>
            <p className="text-right text-xs text-subtext1 mt-1">
              {message.length} / 500 karakter
            </p>
          </div>
          <motion.button
            type="submit"
            className={`w-full font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2
              ${isSubmitting ? 'bg-mauve/70 cursor-not-allowed' : 'bg-mauve hover:bg-pink text-white'}`}
            whileHover={!isSubmitting ? "hover" : "loading"} // Animasi hover hanya jika tidak submitting
            whileTap={!isSubmitting ? "tap" : "loading"} // Animasi tap hanya jika tidak submitting
            animate={isSubmitting ? "loading" : "rest"} // Animasi loading
            variants={buttonVariants}
            disabled={isSubmitting} // Disable tombol saat submit
          >
            {isSubmitting ? (
              <>
                Mengirim... <span className="animate-spin">🌀</span>
              </>
            ) : (
              <>
                Kirim Keluh Kesah ✨
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default IsiForm;