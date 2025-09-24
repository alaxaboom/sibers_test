import React, { useState } from "react";
import { AuthResponse } from "../types";
import "../styles/auth.css";
import { authService } from "../services/authService";

interface AuthPageProps {
  onLogin: (token: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response: AuthResponse = isLogin
        ? await authService.login(formData.username, formData.password)
        : await authService.register({
            ...formData,
            first_name: "",
            last_name: "",
            password: formData.password,
          });

      authService.setToken(response.token);
      onLogin(response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка авторизации");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "🔐 Вход" : "📝 Регистрация"}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="Имя пользователя"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Пароль"
            required
          />
          {!isLogin && (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Email"
              required
            />
          )}
          <button type="submit">
            {isLogin ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Нет аккаунта? Зарегистрируйтесь"
            : "Уже есть аккаунт? Войдите"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
