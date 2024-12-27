'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const IsiForm: React.FC = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'keluhkesah'), {
        name,
        message,
        timestamp: new Date(),
      });
      router.push('/keluhkesah');
    } catch (error) {
      console.error('Error submitting keluh kesah:', error);
    }
  };

  return (
    <div className="min-h-screen bg-mantle flex items-center justify-center px-4">
      <div className="bg-base text-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Isi Keluh Kesahmu</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-2">Nama</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-lavender"
              placeholder="Masukkan nama kamu"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium mb-2">Pesan Keluh Kesah</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-lavender resize-none"
              rows={5}
              placeholder="Tulis keluh kesahmu di sini..."
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue hover:bg-pink text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default IsiForm;
