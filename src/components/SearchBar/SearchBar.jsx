import React, { useState } from 'react';
import { Home, Search, Pencil, Trash2 } from 'lucide-react';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-4xl w-full mx-auto p-4">
      <div className="bg-gray-900 rounded-full flex items-center px-4 py-2 gap-3">
        {/* Home Icon */}
        <button className="text-white hover:text-gray-300 transition-colors">
          <Home size={24} />
        </button>

        {/* Search Icon and Input */}
        <div className="flex items-center flex-1 gap-2">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="What do you want to play?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-gray-400 outline-none w-full text-lg"
          />
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-white transition-colors p-2">
            <Pencil size={20} />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors p-2">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;