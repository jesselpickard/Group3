"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './Navbar.css';
import AvatarPicker from './AvatarPicker';
import { createServerSearchParamsForMetadata } from 'next/dist/server/request/search-params';

function Navbar() {
  // tracks if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // tracks whether the avatar submenu is open
  const [menuOpen, setMenuOpen] = useState(false);
  // tracks which avatar emoji the user has selected with the controller default
  const [selectedAvatar, setSelectedAvatar] = useState("🎮")
  // tracks whether the mobile search popup is open
  const [searchOpen, setSearchOpen] = useState(false);
  // reference to the avatar wrapper so clicks are detected outside of it
  const menuRef = useRef(null);
  // reference to search popup so clicks are detected outside
  const searchRef = useRef(null);

  // closes the submenu when the user clicks anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      // closes search popup when clicking outside of it
      if (createServerSearchParamsForMetadata.current && !searchRef.current.contains(event.target))
        setSearchOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    // cleanup: removes the listener when the component is removed from the page
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <nav className="navbar">
      {/* app title on the top left */}
      <div className="logo">
        <img src="Assets/spellbook-img.png" className="logo-img" alt="" />
        <img src="Assets/spellbook-text.png" className="logo-text" alt="Spellbook" />
      </div>

      {/* normal search bar. hidden on small screens */}
      <div className="search-wrapper">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input className="search-bar" type="text" placeholder="Search..." />
        </div>
      </div>

      {/* right side. search icon on mobile + avatar/login*/}
      <div className="navbar-right">
        {/* mobile search button - only visible on small screens */}
        <div className="search-popup-wrapper" ref={searchRef}>
          <button
            className="search-toggle-btn"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            🔍
          </button>
          {/* search dropdown - appears below button when open */}
          {searchOpen && (
            <div className="search-popup">
              <input
                className="search-bar"
                type="text"
                placeholder="Search..."
                autoFocus
              />
            </div>
          )}
        </div>

      {/* shows avatar if logged in, login button otherwise */}
      {isLoggedIn ? (
        <div className="avatar-wrapper" ref={menuRef}>
          {/* clicking the avatar toggles the submenu */}
          <div className="avatar" onClick={() => setMenuOpen(!menuOpen)}>
            {selectedAvatar}
          </div>

          {/* submenu only renders when menuOpen is true */}
          {menuOpen && (
            <div className="submenu">
              <div className="submenu-email">user@email.com</div>
              <hr className="submenu-divider" />
              {/* avatar picker grid */}
              <AvatarPicker selected = {selectedAvatar} onSelect={setSelectedAvatar} />
              <hr className="submenu-divider" />
              {/* logout sets isLoggedIn back to false, aka logs the user out */}
              <a href="#" onClick={() => {setIsLoggedIn(false); setMenuOpen(false); }}>🚪 Logout</a>
            </div>
          )}
        </div>
      ) : (
        // login button sets isLoggedIn to true
        <button className="login-btn" onClick={() => setIsLoggedIn(true)}>Login</button>
      )}
      </div>
    </nav>

    {/* navigation links below the navbar */}
    <NavLinks />
    </>
  )
}

// renders the page navigation links under the navbar
function NavLinks() {
  return (
    <div className="nav-links">
      <a href="/">Home</a>
      <a href="/Inventory">Inventory</a>
      <a href="/Decks">Decks</a>
    </div>
  )
}

export default Navbar;