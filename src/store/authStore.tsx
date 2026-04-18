import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext } from
'react';
import { getUserProfile } from '../lib/github';
interface AuthContextType {
  user: string | null;
  profileData: string | null;
  login: (username: string) => void;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const generateFingerprint = () => {
  const ua = navigator.userAgent;
  const screenRes = `${window.screen.width}x${window.screen.height}`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return btoa(`${ua}|${screenRes}|${tz}`);
};
export const AuthProvider = ({ children }: {children: ReactNode;}) => {
  const [user, setUser] = useState<string | null>(
    localStorage.getItem('auth_user')
  );
  const [profileData, setProfileData] = useState<string | null>(null);
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_fingerprint');
    localStorage.removeItem('auth_last_activity');
    setProfileData(null);
  }, []);
  const login = (username: string) => {
    setUser(username);
    localStorage.setItem('auth_user', username);
    localStorage.setItem('auth_fingerprint', generateFingerprint());
    localStorage.setItem('auth_last_activity', Date.now().toString());
  };
  // Session timeout & fingerprint verification
  useEffect(() => {
    if (!user) return;
    const storedFingerprint = localStorage.getItem('auth_fingerprint');
    if (storedFingerprint && storedFingerprint !== generateFingerprint()) {
      logout();
      return;
    }
    const checkSession = () => {
      const lastActivity = parseInt(
        localStorage.getItem('auth_last_activity') || '0',
        10
      );
      if (lastActivity && Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
        logout();
      }
    };
    const updateActivity = () => {
      localStorage.setItem('auth_last_activity', Date.now().toString());
    };
    // Initial check
    checkSession();
    // Set up activity listeners
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(interval);
    };
  }, [user, logout]);
  // Poll markdown file every 3 seconds when logged in
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(user);
        setProfileData(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    // Initial fetch
    fetchProfile();
    // Polling every 3 seconds
    const interval = setInterval(fetchProfile, 3000);
    return () => clearInterval(interval);
  }, [user]);
  return (
    <AuthContext.Provider
      value={{
        user,
        profileData,
        login,
        logout
      }}>
      
      {children}
    </AuthContext.Provider>);

};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};