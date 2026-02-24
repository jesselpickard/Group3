import { useState } from 'react';
import './Navbar.css';
import AvatarPicker from './AvatarPicker';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("🎮")

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
        <div className="avatar-wrapper">
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
      <a href="#">Home</a>
      <a href="#">Inventory</a>
      <a href="#">Decks</a>
    </div>
  )
}

export default Navbar;