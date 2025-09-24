import React from "react";
import { Link } from "react-router-dom";
import "../styles/main.css";

interface MainPageProps {
  children: React.ReactNode;
  role: "user" | "admin";
  onLogout: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ children, role, onLogout }) => {
  return (
    <div className="main-layout">
      <nav className="navbar">
        <h2>{role === "admin" ? "🔧 Админ" : "👤 Пользователь"}</h2>
        <div className="nav-links">
          <Link to="/profile" className="nav-link">
            Профиль
          </Link>
          {role === "admin" && (
            <Link to="/users" className="nav-link">
              Пользователи
            </Link>
          )}
          <button onClick={onLogout} className="nav-link logout-btn">
            Выйти
          </button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default MainPage;
