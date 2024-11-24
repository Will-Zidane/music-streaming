import React, { useState, useEffect, useRef } from 'react';
import { Search, Home, Bell, Settings, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import MyIcon from "@/components/MyIcon/MyIcon";
import { useAuth } from "@/utils/AuthContext";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef(null); // Ref to the dropdown container

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    return `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL}${avatarUrl}`;
  };

  const toggleDropdown = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click was outside of the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    // Attach event listener when dropdown is open
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener on component unmount or when dropdown is closed
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="fixed top-0 z-50 w-full bg-neutral-900 border-b border-neutral-800">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center">
            <div className="text-white">
              <MyIcon />
            </div>
          </div>

          {/* Center section with home and search */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-white hover:text-neutral-400">
              <Home size={24} />
            </Link>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to play?"
                className="w-[250px] py-2 pl-12 pr-4 bg-gray-600 text-white placeholder-neutral-400 focus:outline-none rounded-full text-sm"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">


            {user && (
              <Bell className="h-6 w-6 text-white hover:text-neutral-400 cursor-pointer" />
            )}

            {/* Profile Picture with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center text-white hover:text-neutral-400"
              >
                {user && user.avatar?.url ? (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={getAvatarUrl(user.avatar.url)}
                      alt={user.username}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </button>

              {/* Dropdown Menu - Only show when profile is logged in and dropdown is open */}
              {user && isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-neutral-900 rounded-md shadow-lg border border-neutral-800">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-neutral-400 border-b border-neutral-800">
                      {user.username}
                    </div>

                    <Link
                      href="/profile"
                      className="w-full px-4 py-2 flex items-center gap-3 text-sm text-white hover:bg-neutral-800"
                    >
                      <User size={16} />
                      Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="w-full px-4 py-2 flex items-center gap-3 text-sm text-white hover:bg-neutral-800"
                    >
                      <Settings size={16} />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 flex items-center gap-3 text-sm text-white hover:bg-neutral-800"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
