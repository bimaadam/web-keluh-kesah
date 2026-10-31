import React from 'react';
import Link from 'next/link';
import { NotebookRow, metaLabel, primaryButton, textLink } from '@/components/notebook';

const notes = [
  'Nama boleh dikosongin. Tulisanmu bakal muncul sebagai Anonim.',
  'Siapa saja bisa baca, kasih reaksi, dan komentar di tulisanmu.',
  'Hindari nyebut nama asli atau data pribadi orang lain.',
];

const HomePage = () => {
  return (
    <>
      <NotebookRow as="section" className="pt-line-2 pb-line">
        <h1 className="font-serif text-4xl leading-line-2 font-medium tracking-tight text-balance md:text-5xl">
          Tulis aja.
          <br />
          <em className="text-accent">Nggak ada yang nilai.</em>
        </h1>
        <p className="ruled mt-line max-w-[34rem] font-serif text-body">
          Kadang hidup memang berat, dan nggak apa-apa buat ngeluarin unek-unek. Anggap ini halaman belakang buku
          tulis, tempat nulis yang capek, kesel, atau sedih tanpa harus jelasin ke siapa-siapa.
        </p>
        <div className="mt-line flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link href="/isiform" className={primaryButton}>
            Mulai nulis
          </Link>
          <Link href="/keluhkesah" className={textLink}>
            Baca punya orang lain
          </Link>
        </div>
      </NotebookRow>

      <NotebookRow
        as="section"
        aria-labelledby="sebelum-nulis"
        className="pt-line pb-line-2"
        margin={
          <h2 id="sebelum-nulis" className={`${metaLabel} leading-line`}>
            Sebelum nulis
          </h2>
        }
      >
        <ul className="ruled max-w-[34rem] font-serif text-body">
          {notes.map((note) => (
            <li key={note} className="flex gap-3">
              <span aria-hidden="true" className="text-muted">–</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </NotebookRow>
    </>
  );
};

export default HomePage;
