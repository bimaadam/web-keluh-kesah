// components/keluhkesah/LoadingAndEmptyStates.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { NotebookRow, textLink } from '../notebook';

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
                    <NotebookRow
                        key={index}
                        className="pb-line-2 motion-safe:animate-pulse"
                        margin={<div className="mb-2 h-3 w-12 rounded-xs bg-rule md:mt-2 md:mb-0 md:ml-auto" />}
                    >
                        <div className="ruled h-[calc(var(--line)*3)]" />
                        <div className="mt-2 h-3 w-24 rounded-xs bg-rule" />
                    </NotebookRow>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <NotebookRow role="alert">
                <p className="font-medium text-danger">Keluh kesah gagal dimuat.</p>
                <p className="mt-1 text-sm text-muted">{error}. Cek koneksimu, lalu muat ulang halaman.</p>
            </NotebookRow>
        );
    }

    if (entriesCount === 0) {
        return (
            <NotebookRow>
                <p className="ruled font-serif text-body">Halaman ini masih kosong. Belum ada yang nulis.</p>
                <Link href="/isiform" className={`${textLink} mt-3 inline-block`}>Jadi yang pertama nulis</Link>
            </NotebookRow>
        );
    }

    return null;
};

export default LoadingAndEmptyStates;
