import React, { useState } from 'react';
import { Search, Home, Bell } from 'lucide-react';
import Link from 'next/link';
import MyIcon from "@/components/MyIcon/MyIcon";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full bg-black px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Logo (you can replace this with your own logo component) */}
          <div className="text-white">
            <MyIcon/>
          </div>
        </div>

        {/* Center section with home and search */}
        <div className="flex items-center gap-2 flex-1 justify-center max-w-3xl">
          {/* Home button */}
          <Link href={'/'} className="p-2 bg-neutral-900 rounded-full hover:bg-neutral-800">
            <Home className="text-white" size={20} />
          </Link>

          {/* Search bar container */}
          <div className="relative flex-1 max-w-xl">
            <div className="relative flex items-center bg-neutral-900 rounded-full hover:bg-neutral-800">
              {/* Search Icon */}
              <Search className="absolute left-4 text-neutral-400" size={20} />

              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to play?"
                className="w-full py-2 pl-12 pr-4 bg-transparent text-white placeholder-neutral-400 focus:outline-none rounded-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Install App Button */}
          <button className="px-4 py-1 text-neutral-400 hover:text-white text-sm font-medium">
            Install App
          </button>

          {/* Notifications */}
          <button className="p-2 hover:bg-neutral-800 rounded-full">
            <Bell className="text-white" size={20} />
          </button>

          {/* Profile Picture */}
          <button className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden">
            <img
              src="/api/placeholder/32/32"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;