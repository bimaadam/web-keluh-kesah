// components/keluhkesah/LoadingAndEmptyStates.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface LoadingAndEmptyStatesProps {
    isLoading: boolean;
    error: string | null;
    entriesCount: number;
}

const SKELETON_ROWS = 3;

const LoadingAndEmptyStates: React.FC<LoadingAndEmptyStatesProps> = ({
    isLoading,
    error,
    entriesCount,
}) => {
    if (isLoading) {
        // Blank ruled lines, like a page nobody has written on yet
        return (
            <div aria-busy="true" aria-label="Memuat keluh kesah">
                {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                    <div key={index} className="nb-row pb-[calc(var(--line)*2)] motion-safe:animate-pulse">
                        <div className="nb-margin">
                            <div className="mb-2 h-3 w-12 rounded-sm bg-rule md:mb-0 md:ml-auto md:mt-2" />
                        </div>
                        <div className="nb-body">
                            <div className="ruled h-[calc(var(--line)*3)]" />
                            <div className="mt-2 h-3 w-24 rounded-sm bg-rule" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div role="alert" className="nb-row">
                <div className="nb-margin" />
                <div className="nb-body">
                    <p className="font-medium text-danger">Keluh kesah gagal dimuat.</p>
                    <p className="mt-1 text-sm text-muted">{error}. Cek koneksimu, lalu muat ulang halaman.</p>
                </div>
            </div>
        );
    }

    if (entriesCount === 0) {
        return (
            <div className="nb-row">
                <div className="nb-margin" />
                <div className="nb-body">
                    <p className="ruled font-serif text-[1.0625rem]">Halaman ini masih kosong. Belum ada yang nulis.</p>
                    <Link href="/isiform" className="link mt-3 inline-block">Jadi yang pertama nulis</Link>
                </div>
            </div>
        );
    }

    return null;
};

export default LoadingAndEmptyStates;
