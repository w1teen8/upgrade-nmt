import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        UpGrade NMT
      </Link>
      <nav className="navbar-links">
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
    </header>
  );
}
