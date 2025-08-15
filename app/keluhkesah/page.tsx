// app/keluhkesah/page.tsx
'use client';

import { KeluhKesahList } from '@/components/keluhkesah';
import { Toaster } from 'react-hot-toast';

export default function KeluhKesahPage() {
  return (
    <>
      <Toaster />
      <KeluhKesahList />
    </>
  );
}