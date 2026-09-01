import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className={`navbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          UpGrade<span className="logo-dot">.</span>NMT
        </Link>

        <button
          type="button"
          className="navbar-burger"
          aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`navbar-links ${menuOpen ? "is-open" : ""}`}>
          <Link to="/" state={{ scrollTo: "courses" }}>
            Курси
          </Link>
          <Link to="/referral">Реферальна система</Link>
          {user ? (
            <>
              <Link to="/dashboard">Мої курси</Link>
              {user.role === "admin" && (
                <>
                  <Link to="/admin/courses">Адмін</Link>
                  <Link to="/admin/users">Користувачі</Link>
                </>
              )}
              <button className="link-button" onClick={handleLogout}>
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Увійти</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Реєстрація
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
