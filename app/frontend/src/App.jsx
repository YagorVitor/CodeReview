import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { FeedProvider } from "./context/FeedContext";
import { NotificationProvider } from "./context/NotificationContext"

import ProtectedRoute from "./components/ProtectedRoute";
import HeaderPage from "./components/HeaderPage/HeaderPage";
import FooterPage from "./components/FooterPage/FooterPage";
import AnimatedPage from "./components/AnimatedPage";

import HomePage from "./components/HomePage/HomePage";
import UserSignup from "./components/UserSignup/UserSignup";
import UserLogin from "./components/UserLogin/UserLogin";
import PrivacyPolicyPage from "./components/PrivacyPolicyPage/PrivacyPolicyPage";
import TermsPage from "./components/TermsPage/TermsPage";
import ContactPage from "./components/ContactPage/ContactPage";
import FeedPage from "./components/FeedPage";
import UserProfile from "./components/UserProfile/UserProfile";
import SearchPage from "./components/SearchPage/SearchPage";
import PostPage from "./components/PostPage/PostPage";
import SettingsPage from "./components/SettingsPage/SettingsPage";

function AppContent() {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-screen">Carregando...</div>;

  return (
    <div className="app-wrapper">
      <HeaderPage />

      <div className="content">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            {/* Página inicial dinâmica */}
            <Route
              path="/"
              element={
                <AnimatedPage>
                  {user ? <FeedPage /> : <HomePage />}
                </AnimatedPage>
              }
            />

            {/* Rotas públicas */}
            <Route
              path="/signup"
              element={
                <AnimatedPage>
                  <UserSignup />
                </AnimatedPage>
              }
            />
            <Route
              path="/login"
              element={
                <AnimatedPage>
                  <UserLogin />
                </AnimatedPage>
              }
            />
            <Route
              path="/privacy"
              element={
                <AnimatedPage>
                  <PrivacyPolicyPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/terms"
              element={
                <AnimatedPage>
                  <TermsPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/contact"
              element={
                <AnimatedPage>
                  <ContactPage />
                </AnimatedPage>
              }
            />

            {/* Rotas protegidas */}
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <AnimatedPage>
                    <FeedPage />
                  </AnimatedPage>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AnimatedPage>
                    <UserProfile />
                  </AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <AnimatedPage>
                    <UserProfile />
                  </AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <AnimatedPage>
                    <SearchPage />
                  </AnimatedPage>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/:id"
              element={
                <ProtectedRoute>
                  <AnimatedPage>
                    <SettingsPage />
                  </AnimatedPage>
                </ProtectedRoute>
              }
            />

            {/* Perfil público por username */}
            <Route
              path="/user/:username"
              element={
                <AnimatedPage>
                  <UserProfile />
                </AnimatedPage>
              }
            />

            {/* Visualização de post individual */}
            <Route
              path="/post/:id"
              element={
                <AnimatedPage>
                  <PostPage />
                </AnimatedPage>
              }
            />

            {/* Rota 404 futura */}
            {/* <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} /> */}
          </Routes>
        </AnimatePresence>
      </div>

      <FooterPage />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FeedProvider>
        <NotificationProvider>
          <Router>
            <AppContent />
          </Router>
        </NotificationProvider>
      </FeedProvider>
    </AuthProvider>
  );
}