// components/keluhkesah/LoadingAndEmptyStates.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ENTRIES_PER_PAGE } from 'app/constants/KeluhKesahConstants';

interface LoadingAndEmptyStatesProps {
    isLoading: boolean;
    error: string | null;
    entriesCount: number;
}

const LoadingAndEmptyStates: React.FC<LoadingAndEmptyStatesProps> = ({
    isLoading,
    error,
    entriesCount,
}) => {
    if (isLoading) {
        return (
            Array(ENTRIES_PER_PAGE)
                .fill(0)
                .map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse bg-surface1/70 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-surface0 h-52 sm:h-56 flex flex-col justify-between"
                    >
                        <div className="h-7 bg-gray-600 rounded-lg w-2/5 mb-4"></div>
                        <div className="h-5 bg-gray-500 rounded-lg w-full mb-3"></div>
                        <div className="h-5 bg-gray-500 rounded-lg w-3/4 mb-5"></div>
                        <div className="flex justify-end gap-3 mt-auto">
                            <div className="h-9 w-24 bg-gray-700 rounded-full"></div>
                            <div className="h-9 w-24 bg-gray-700 rounded-full"></div>
                            <div className="h-9 w-24 bg-gray-700 rounded-full"></div>
                        </div>
                    </div>
                ))
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/30 text-red-300 p-6 rounded-lg text-center flex items-center justify-center gap-2 border border-red-400/50"
            >
                😔 {error}
            </motion.div>
        );
    }

    if (entriesCount === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface1/70 backdrop-blur-sm text-subtext0 p-8 rounded-xl text-center shadow-xl border border-surface0"
            >
                <p className="text-xl sm:text-2xl mb-3 font-semibold text-lavender">Belum ada keluh kesah nih... 🤫</p>
                <p className="text-base sm:text-lg text-subtext0 leading-relaxed">
                    Mungkin kamu bisa jadi yang pertama berbagi? Tekan tombol "Mulai Keluh Kesah" di halaman utama ya! ✨
                </p>
            </motion.div>
        );
    }

    return null;
};

export default LoadingAndEmptyStates;