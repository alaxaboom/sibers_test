import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import MainPage from "./pages/MainPage";
import UserDashboard from "./pages/components/UserDashboard";
import AdminDashboard from "./pages/components/AdminDashboard";
import UserList from "./pages/components/UserList";
import ProfilePage from "./pages/components/ProfilePage";
import { authService } from "./services/authService";
import { User } from "./types"; // Добавьте import

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogin = (newToken: string) => {
    authService.setToken(newToken);
    setToken(newToken);
    fetchUser(newToken);
  };

  const handleLogout = () => {
    authService.removeToken();
    setToken(null);
    setUser(null);
  };

  const fetchUser = async (token: string) => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData); // Full User
    } catch {
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <Router>
      <Routes>
        {!token ? (
          <Route path="*" element={<AuthPage onLogin={handleLogin} />} />
        ) : (
          <>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route
              path="/dashboard"
              element={
                <MainPage
                  role={user!.role as "user" | "admin"}
                  onLogout={handleLogout}
                >
                  {user?.role === "admin" ? (
                    <AdminDashboard />
                  ) : (
                    <UserDashboard />
                  )}
                </MainPage>
              }
            />
            <Route
              path="/users"
              element={
                user?.role === "admin" ? (
                  <MainPage role="admin" onLogout={handleLogout}>
                    <UserList />
                  </MainPage>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                <MainPage
                  role={user!.role as "user" | "admin"}
                  onLogout={handleLogout}
                >
                  <ProfilePage onLogout={handleLogout} />
                </MainPage>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <MainPage
                  role={user!.role as "user" | "admin"}
                  onLogout={handleLogout}
                >
                  <ProfilePage onLogout={handleLogout} />
                </MainPage>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
