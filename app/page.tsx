'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

const HomePage: React.FC = () => {
  const router = useRouter();

  const handleStart = () => {
    router.push('/isiform');
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-mantle to-base flex flex-col items-center justify-center px-4">
      <header className="text-center mb-10">
      <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-b from-maroon to-mauve text-transparent bg-clip-text drop-shadow-lg">
  Keluh Kesah Hidup
</h1>
        <p className="text-lg md:text-xl text-white mt-4 max-w-2xl">
          Kadang hidup memang berat, dan nggak apa-apa untuk mengeluarkan unek-unekmu. Mari berbagi keluh kesahmu di sini.
        </p>
      </header>

      <div className="bg-base shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-yellow text-center mb-6">Isi Keluh Kesahmu di Sini</h2>
        <button
          onClick={handleStart}
          className="mt-4 w-full bg-surface1 hover:bg-mauve text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          Mulai Keluh Kesah
        </button>
      </div>
    </div> 
    </>
  );
};

export default HomePage;
