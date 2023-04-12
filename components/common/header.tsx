import React, { FC, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@lula-technologies-inc/lux";
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

const Header: FC = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { user, signOut } = useFirebaseAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    signOut();
    setDropdownVisible(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full h-16 bg-primary shadow">
      <div className="h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <Link className="grid place-content-center" href="/">
            <Icon
              icon="lula-logo"
              title="LULA Logo"
              className="text-lula aria-hidden mt-1"
              style={{ width: 150, height: 31 }}
            />
        </Link>
        {user && (<div className="relative ml-auto">
          <button
            className="rounded-full border-2 border-primary grid place-content-center cursor-pointer"
            onClick={toggleDropdown}
          >
            <Icon
              icon="user"
              title="User Icon"
              className="text-primary aria-hidden p-2 fa-solid"
              style={{ width: 22, height: 22 }}
            />
          </button>
          {/* Dropdown */}
          {dropdownVisible && (
            <div ref={dropdownRef} className="absolute overflow-hidden right-0 mt-3 w-48 bg-primary rounded-lg shadow-2xl divide-y divide-gray-100 text-primary text-sm z-10 animate-fade-in-down">
              
              <div className="px-4 py-2">
                Signed in as:
                <div className="font-semibold">{user?.email}</div>
              </div>
              <button
                className="w-full px-4 py-2 text-center text-white bg-red-500 hover:bg-red-600"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          )}
        </div>)}
      </div>
    </div>
  );
};

export default Header;
