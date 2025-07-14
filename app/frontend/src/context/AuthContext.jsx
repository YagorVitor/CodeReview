import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("user");
    if (token && userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      setFollowersCount(parsedUser.followers_count ?? 0);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setFollowersCount(userData.followers_count ?? 0);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setFollowersCount(0);
  };

  // Função para atualizar followersCount globalmente
  const updateFollowersCount = (newCount) => {
    setFollowersCount(newCount);
    // Também atualiza o user no estado e localStorage para manter sincronizado
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const updatedUser = { ...prevUser, followers_count: newCount };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, followersCount, updateFollowersCount }}
    >
      {children}
    </AuthContext.Provider>
  );
}
