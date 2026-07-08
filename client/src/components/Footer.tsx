import { Link } from "react-router-dom";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Link to="/" className="footer-brand">
            UpGrade NMT
          </Link>
          <p className="footer-tagline">
            Підготовка до НМТ з історії України та української мови: відеолекції, конспекти,
            шпаргалки й тести по кожній темі програми.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Навчання</h4>
            <Link to="/" state={{ scrollTo: "courses" }}>
              Курси
            </Link>
            <Link to="/register">Реєстрація</Link>
            <Link to="/login">Увійти</Link>
          </div>
          <div className="footer-col">
            <h4>Кабінет</h4>
            <Link to="/dashboard">Мої курси</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">© {year} UpGrade NMT. Усі права захищено.</div>
    </footer>
  );
}
