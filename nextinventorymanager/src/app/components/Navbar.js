"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './Navbar.css';
import AvatarPicker from './AvatarPicker';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("🎮")
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <nav className="navbar">
      <div className="logo">MTG Inventory Manager</div>
      <div className="search-wrapper">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input className="search-bar" type="text" placeholder="Search..." />
        </div>
      </div>
      {isLoggedIn ? (
        <div className="avatar-wrapper" ref={menuRef}>
          <div className="avatar" onClick={() => setMenuOpen(!menuOpen)}>
            {selectedAvatar}
          </div>
          {menuOpen && (
            <div className="submenu">
              <div className="submenu-email">user@email.com</div>
              <hr className="submenu-divider" />
              <AvatarPicker selected = {selectedAvatar} onSelect={setSelectedAvatar} />
              <hr className="submenu-divider" />
              <a href="#" onClick={() => setIsLoggedIn(false)}>🚪 Logout</a>
            </div>
          )}
        </div>
      ) : (
        <button className="login-btn" onClick={() => setIsLoggedIn(true)}>Login</button>
      )}
    </nav>
    <NavLinks />
    </>
  )
}

function NavLinks() {
  return (
    <div className="nav-links">
      <a href="./Home">Home</a>
      <a href="./Inventory">Inventory</a>
      <a href="./Decks">Decks</a>
    </div>
  )
}

export default Navbar;