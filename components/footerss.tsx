import React from 'react';

const Footerss = () => {
  return (
    <div className="bg-base text-pink py-4 w-full">
      <footer className="text-center">
        <p>
          Made with ❤️ by <span className="text-white font-bold">Bima Adam Nugraha</span>
        </p>
        <p className="text-sm mt-1">© {new Date().getFullYear()} All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Footerss;
