import React, { FC } from "react";
import Link from "next/link";
import clsx from "clsx";
import Icon from "../Icon";

type HeaderProps = {}; // Oh, you're going to need it

const Header: FC<HeaderProps> = () => {
  return (
    <div className="w-full h-16 bg-white shadow">
      <div
        className={clsx(
          "max-w-6xl h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center"
        )}
      >
        {/*
          This is just for the initial setup. All this needs to be refactored
          properly by isolating components the way they belong, making menu items
          not hard coded, and generally following the practices from the lula app
        */}
        <Link className="block self-center" href="/">
          <Icon
            icon="fa-lula-logo"
            className="text-lula"
            style={{ width: 150, height: 31 }}
          />
        </Link>
        <nav className="flex gap-6 mx-auto rounded-full bg-white bg-opacity-50 px-4">
          <Link
            href="/products"
            className={clsx(
              "block",
              "self-center",
              "hover:opacity-75",
              "focus:opacity-75",
              "focus:outline-none",
              "text-text_primary"
            )}
            key="/products"
          >
            Products
          </Link>
          <Link
            href="/customers"
            className={clsx(
              "block",
              "self-center",
              "hover:opacity-75",
              "focus:opacity-75",
              "focus:outline-none",
              "text-text_primary"
            )}
            key="/customers"
          >
            Customers
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Header;
