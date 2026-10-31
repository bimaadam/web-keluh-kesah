import React from 'react';
import Link from 'next/link';

const notes = [
  'Nama boleh dikosongin. Tulisanmu bakal muncul sebagai Anonim.',
  'Siapa saja bisa baca, kasih reaksi, dan komentar di tulisanmu.',
  'Hindari nyebut nama asli atau data pribadi orang lain.',
];

const HomePage = () => {
  return (
    <>
      <section className="nb-row pb-line pt-[calc(var(--line)*2)]">
        <div className="nb-margin" />
        <div className="nb-body">
          <h1 className="font-serif text-4xl font-medium leading-[calc(var(--line)*2)] tracking-tight md:text-5xl md:leading-[calc(var(--line)*2)]">
            Tulis aja.
            <br />
            <em className="text-accent">Nggak ada yang nilai.</em>
          </h1>
          <p className="ruled mt-line max-w-[34rem] font-serif text-[1.0625rem]">
            Kadang hidup memang berat, dan nggak apa-apa buat ngeluarin unek-unek. Anggap ini halaman belakang buku
            tulis, tempat nulis yang capek, kesel, atau sedih tanpa harus jelasin ke siapa-siapa.
          </p>
          <div className="mt-line flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="/isiform" className="btn-primary">
              Mulai nulis
            </Link>
            <Link href="/keluhkesah" className="link">
              Baca punya orang lain
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="sebelum-nulis" className="nb-row pt-line pb-[calc(var(--line)*2)]">
        <div className="nb-margin">
          <h2 id="sebelum-nulis" className="meta leading-line">
            Sebelum nulis
          </h2>
        </div>
        <div className="nb-body">
          <ul className="ruled max-w-[34rem] font-serif text-[1.0625rem]">
            {notes.map((note) => (
              <li key={note} className="flex gap-3">
                <span aria-hidden="true" className="text-muted">–</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
};

export default HomePage;
