import React from 'react';

const Footerss = () => {
  return (
    <footer className="nb-row mt-auto border-t border-rule">
      <div className="nb-margin" />
      <div className="nb-body flex flex-wrap justify-between gap-x-6 gap-y-1 py-6 text-xs text-muted">
        <p>Semua tulisan di sini anonim dan bisa dibaca siapa saja.</p>
        <p>© {new Date().getFullYear()} · Dibuat oleh Unknown</p>
      </div>
    </footer>
  );
};

export default Footerss;
