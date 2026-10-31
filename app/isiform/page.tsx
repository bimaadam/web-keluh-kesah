'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Import serverTimestamp
import { db } from '../../utils/firebase';
import { toast } from 'react-hot-toast';
import { NotebookRow, inputField, metaLabel, primaryButton, ruledField } from '@/components/notebook';

const MAX_MESSAGE_LENGTH = 500;

const IsiForm: React.FC = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // State untuk loading tombol
  const [today, setToday] = useState('');
  const router = useRouter();

  // Diisi setelah mount supaya HTML hasil prerender tidak membawa tanggal saat build
  useEffect(() => {
    setToday(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Isinya masih kosong.');
      return;
    }

    setIsSubmitting(true); // Mulai loading

    try {
      await addDoc(collection(db, 'keluhkesah'), {
        name: name.trim(),
        message: message.trim(),
        timestamp: serverTimestamp(), // Gunakan serverTimestamp untuk konsistensi waktu
      });
      toast.success('Tulisanmu sudah tersimpan.');
      setName(''); // Kosongkan form
      setMessage('');
      // Delay sedikit sebelum navigasi agar notifikasi terlihat
      setTimeout(() => {
        router.push('/keluhkesah');
      }, 1500);
    } catch (error) {
      console.error('Error submitting keluh kesah:', error);
      toast.error('Gagal menyimpan. Cek koneksimu, lalu kirim lagi.');
    } finally {
      setIsSubmitting(false); // Selesai loading
    }
  };

  return (
    <section className="pt-line pb-line-2">
      <NotebookRow>
        <p className={metaLabel}>
          Hari/Tgl <span className="ml-2 tracking-normal text-ink normal-case">{today}</span>
        </p>
        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-balance md:text-4xl">Tulis keluh kesahmu</h1>
        <p className="mt-2 max-w-[34rem] text-muted">Begitu dikirim, tulisanmu langsung muncul di halaman Baca.</p>
      </NotebookRow>

      <form onSubmit={handleSubmit} className="mt-line">
        <NotebookRow
          margin={<label htmlFor="name" className="mb-1.5 block text-sm font-medium md:mb-0 md:pt-2.5">Nama</label>}
        >
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputField} max-w-[22rem]`}
            placeholder="Hamba Allah"
            maxLength={50} // Batasi panjang nama
            aria-describedby="name-hint"
          />
          <p id="name-hint" className="mt-1.5 text-xs text-muted">Boleh dikosongin atau pakai nama samaran.</p>
        </NotebookRow>

        <NotebookRow
          className="mt-line"
          margin={<label htmlFor="message" className="mb-1.5 block text-sm leading-line font-medium md:mb-0">Isi</label>}
        >
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${ruledField} min-h-[calc(var(--line)*5)]`}
            rows={8}
            placeholder="Lagi kepikiran apa?"
            required
            maxLength={MAX_MESSAGE_LENGTH} // Batasi panjang pesan
            aria-describedby="message-count"
          ></textarea>
          <p id="message-count" className="mt-2 text-right text-xs text-muted tabular-nums">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </p>
        </NotebookRow>

        <NotebookRow className="mt-line">
          <button type="submit" className={primaryButton} disabled={isSubmitting}>
            {isSubmitting ? 'Mengirim…' : 'Kirim'}
          </button>
        </NotebookRow>
      </form>
    </section>
  );
};

export default IsiForm;
