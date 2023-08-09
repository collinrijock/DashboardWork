import React, { FC, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Icon, ICON_SIZES } from "@lula-technologies-inc/lux";
import { useRouter } from 'next/router';
import useDarkMode from '@/hooks/useDarkMode';
import { useAuthContext } from "@/hooks/auth";

const Header: FC = () => {
  const router = useRouter();
  const currentRoute = router.pathname;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { user, logout } = useAuthContext();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setDarkMode, darkMode } = useDarkMode();
  const excludedButtonRef = useRef<HTMLElement>(null);


  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = async () => {
    await logout();
    setDropdownVisible(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    // Check if the click was outside the dropdown AND not on the excluded button
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      (!excludedButtonRef.current || !excludedButtonRef.current.contains(event.target as Node))
    ) {
      setDropdownVisible(false);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Trucking', href: '/policy/trucking' },
  ];

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full h-20 bg-primary shadow">
      <div className="h-20 mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        {/* logo */}
        <Link className="grid place-content-center" href="/">
          <Icon
            icon="lula-logo"
            title="LULA Logo"
            className="text-lula aria-hidden mt-1"
            size={ICON_SIZES.XL}
          />
        </Link>

        {/* Render navigation links */}
        <div className="ml-auto flex flex-row">
          {navLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              <p className={`${currentRoute === link.href ? 'text-primary' : 'text-primary-dimmed'}  hover:text-primary ml-4 transition-all duration-200`}>{link.label}</p>
            </Link>
          ))}
        </div>

        {user && (<div className="relative ml-10">
          <button
            className="rounded-full w-10 h-10 border-2 border-primary-dimmed hover:border-primary grid place-content-center cursor-pointer transition-all duration-200 animate-fade-in"
            onClick={toggleDropdown}
            // @ts-ignore
            ref={excludedButtonRef}
          >
            <Icon
              icon="user"
              title="User Icon"
              className="text-primary-dimmed aria-hidden p-2 fa-solid hover:text-primary transition-all duration-200"
              size={ICON_SIZES.XL}
            />
          </button>
          {/* Dropdown */}
          {dropdownVisible && (
            <div ref={dropdownRef} className="absolute overflow-hidden right-0 mt-6 w-48 bg-primary rounded-lg shadow-xl text-primary text-sm z-10 animate-fade-in-down">

              <div className="px-4 py-2 text-center text-primary-dimmed">
                Signed in as:
                <div className="font-semibold text-center text-primary">{user?.email}</div>
              </div>
              <div>
                <button
                  className="w-full px-4 py-2 text-center text-primary-dimmed border-t border-secondary hover:bg-primary-hover"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  Toggle Dark Mode
                </button>
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
