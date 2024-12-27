'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navigateToHome = () => {
    router.push('/');
  };

  const navigateToDonasi = () => {
    router.push('https://saweria.co/bimrin');
  };

  const navigateToKeluhKesah = () => {
    router.push('/keluhkesah');
  };

  return (
    <nav className="bg-base text-white py-4 px-6 flex justify-between items-center">
      <div className="text-xl font-bold">
        <button 
        className='bg-red rounded-lg py-1 p-3 hover:bg-sky'
        onClick={navigateToHome}>
          Keluh Kesah | Home
        </button>
      </div>

      <div className="flex items-center md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {/* Hamburger Icon */}
          ☰
        </button>
      </div>

      <div className={`flex-col md:flex md:flex-row md:space-x-4 ${isOpen ? 'block' : 'hidden'} md:block`}>
        <button
          onClick={navigateToDonasi}
          className="bg-mauve mr-1 hover:bg-pink text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Donasi
        </button>
        <button
          onClick={navigateToKeluhKesah}
          className="bg-surface1 hover:bg-red text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
        >
          Keluh Kesah Pengguna Lain
        </button>
      </div>
    </nav>
  );
};

export default Navbar;