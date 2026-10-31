import React from 'react';
import { NotebookRow } from './notebook';

const Footerss = () => {
  return (
    <NotebookRow as="footer" className="mt-auto border-t border-rule">
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-6 text-xs text-muted">
        <p>Semua tulisan di sini anonim dan bisa dibaca siapa saja.</p>
        <p>© {new Date().getFullYear()} · Dibuat oleh Unknown</p>
      </div>
    </NotebookRow>
  );
};

export default Footerss;
