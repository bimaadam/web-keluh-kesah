'use client'

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase';

interface Entry {
  id: string;
  name: string;
  message: string;
}

const KeluhKesah: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true); // State loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'keluhkesah'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        setEntries(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry)));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false); // Selesai loading
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-base flex flex-col items-center py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-mauve mb-4 drop-shadow-md">Keluh Kesah</h1>
        <p className="text-pink text-lg max-w-xl">
          Lihat keluh kesah pengguna lain di sini, siapa tahu ada yang relatable banget sama kamu. Yuk, scroll ke bawah!
        </p>
      </header>

      <div className="space-y-6 w-full max-w-3xl">
        {isLoading ? (
          // Skeleton loading
          Array(5)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-surface1 rounded-lg h-24 w-full shadow-md p-6"
              >
                <div className="h-4 bg-gray-400 rounded w-1/3 mb-4"></div>
                <div className="h-3 bg-gray-400 rounded w-3/4"></div>
              </div>
            ))
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-surface1 shadow-md rounded-lg p-6 border-l-4 border-lavender flex flex-col gap-2"
            >
              <h2 className="text-lg font-semibold text-mauve">
                {entry.name} <span className="text-sm text-subtext1">berkata:</span>
              </h2>
              <p className="text-white italic">"{entry.message}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KeluhKesah;
