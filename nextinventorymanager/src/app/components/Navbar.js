"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "./Navbar.css";
import AvatarPicker from "./AvatarPicker";
import { createClient } from "@/lib/supabase/client";

function Navbar() {
  const supabase = useMemo(() => createClient(), []);
  const pathname = usePathname();

  const [user, setUser] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loginWithGoogle(e) {
    e.preventDefault();

    const next = pathname || "/";
    const safeNext = next.startsWith("/") ? next : "/";

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      safeNext
    )}`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  async function logout(e) {
    e.preventDefault();
    await supabase.auth.signOut();
    setMenuOpen(false);
  }

  const isLoggedIn = !!user;

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <img src="Assets/spellbook-img.png" className="logo-img" alt="" />
          <img src="Assets/spellbook-text.png" className="logo-text" alt="Spellbook" />
        </div>

        <div className="search-wrapper">
          <div className="search-container">
            <span className="search-icon"></span>
            <input className="search-bar" type="text" placeholder="Search..." />
          </div>
        </div>

        <div className="navbar-right">
          <div className="search-popup-wrapper" ref={searchRef}>
            <button
              className="search-toggle-btn"
              onClick={() => setSearchOpen(!searchOpen)}
            ></button>

            {searchOpen && (
              <div className="search-popup">
                <input className="search-bar" type="text" placeholder="Search..." autoFocus />
              </div>
            )}
          </div>

          {isLoggedIn ? (
            <div className="avatar-wrapper" ref={menuRef}>
              <div className="avatar" onClick={() => setMenuOpen(!menuOpen)}>
                {selectedAvatar}
              </div>

              {menuOpen && (
                <div className="submenu">
                  <div className="submenu-email">{user?.email}</div>
                  <hr className="submenu-divider" />
                  <AvatarPicker selected={selectedAvatar} onSelect={setSelectedAvatar} />
                  <hr className="submenu-divider" />
                  <a href="#" onClick={logout}>
                    Logout
                  </a>
                </div>
              )}
            </div>
          ) : (
            // Keeps the same layout/styling (login-btn), but triggers Google OAuth
            <a className="login-btn" href="#" onClick={loginWithGoogle}>
              Login
            </a>
          )}
        </div>
      </nav>

      <NavLinks />
    </>
  );
}

function NavLinks() {
  return (
    <div className="nav-links">
      <a href="/">Home</a>
      <a href="/Inventory">Inventory</a>
      <a href="/Decks">Decks</a>
    </div>
  );
}

export default Navbar;