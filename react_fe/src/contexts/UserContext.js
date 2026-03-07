// src/contexts/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService from 'services/AuthService';
import ProfileService from 'services/ProfileService';

const UserContext = createContext({
  user: null,
  isAuthenticated: false,
  loadingUser: false,
  setUser: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // full profile từ /api/users/me
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUserProfile = async () => {
    const token = AuthService.getAccessToken();
    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    setLoadingUser(true);
    try {
      const res = await ProfileService.getProfile(); // GET /api/users/me
      setUser(res.data);
    } catch (err) {
      console.error('❌ Failed to load user profile:', err);
      AuthService.logout();
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    // khi app mount, nếu có access token thì gọi API lấy user
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🚪 Logout
  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        loadingUser,
        logout,
        refreshUser: fetchUserProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
