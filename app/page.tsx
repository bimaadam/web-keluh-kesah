'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'; // Import motion dari framer-motion

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleStart = () => {
    router.push('/isiform');
  };

  // Varian untuk animasi judul dan paragraf
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3 // Animasi anak-anak akan muncul secara berurutan
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring", // Efek pegas
        stiffness: 100
      }
    }
  };

  // Varian untuk floating emojis
  const emojiVariants = {
    initial: { y: 0, opacity: 0.5 },
    animate: (i: number) => ({
      y: [0, -20 * (i % 2 === 0 ? 1 : -1), 0], // Gerakan naik turun acak
      rotate: [0, 5 * (i % 3 === 0 ? 1 : -1), 0], // Rotasi kecil
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 8 + i * 2, // Durasi acak
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 1,
        delay: i * 0.5 // Delay awal untuk setiap emoji
      }
    })
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-mantle to-base flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Floating Emojis with Framer Motion */}
        {['😔', '😟', '😥', '💭', '💔'].map((emoji, index) => (
          <motion.span
            key={index}
            className="absolute text-5xl z-0"
            style={{
              top: `${Math.random() * 70 + 10}%`, // Posisi vertikal acak
              left: `${Math.random() * 80 + 10}%`, // Posisi horizontal acak
            }}
            initial="initial"
            animate="animate"
            custom={index} // Meneruskan index untuk variasi animasi
          >
            {emoji}
          </motion.span>
        ))}

        <motion.header
          className="text-center mb-10 z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold bg-gradient-to-b from-maroon to-mauve text-transparent bg-clip-text drop-shadow-lg"
          >
            Keluh Kesah Hidup
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white mt-4 max-w-2xl"
          >
            Kadang hidup memang berat, dan nggak apa-apa untuk mengeluarkan unek-unekmu. Mari berbagi keluh kesahmu di sini. Jujur dan lega bersama! 💬✨
          </motion.p>
        </motion.header>

        <motion.div
          className="bg-base shadow-lg rounded-lg p-8 max-w-md w-full z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }} // Delay agar muncul setelah teks
        >
          <motion.button
            onClick={handleStart}
            className="mt-4 w-full bg-surface1 hover:bg-mauve text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            whileHover={{ scale: 1.05 }} // Animasi saat di-hover
            whileTap={{ scale: 0.95 }} // Animasi saat di-tap/klik
          >
            Mulai Keluh Kesah ✨
          </motion.button>
        </motion.div>
      </div>
    </>
  );
};

export default HomePage;