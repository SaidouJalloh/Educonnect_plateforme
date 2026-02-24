import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Student } from '@/services/api';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  niveau: string;
  filiere?: string;
  pays?: string;
  ville?: string;
  interets?: string[];
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface AppContextType {
  // State
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  chatSessions: ChatSession[];
  notifications: Notification[];
  
  // Functions
  login: (user: User) => void;
  logout: () => void;
  setCurrentUser: (user: User | null) => void;
  showError: (message: string) => void;
  clearError: () => void;
  addChatSession: (session: ChatSession) => void;
  updateChatSession: (id: string, messages: Message[]) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'educonnect_user';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedUser) {
        const user = JSON.parse(savedUser) as User;
        setCurrentUserState(user);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'utilisateur:', err);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((user: User) => {
    setCurrentUserState(user);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setCurrentUserState(null);
    setChatSessions([]);
    setNotifications([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const showError = useCallback((message: string) => {
    setError(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const addChatSession = useCallback((session: ChatSession) => {
    setChatSessions((prev) => [...prev, session]);
  }, []);

  const updateChatSession = useCallback((id: string, messages: Message[]) => {
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === id
          ? { ...session, messages, updatedAt: new Date().toISOString() }
          : session
      )
    );
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        read: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: AppContextType = {
    currentUser,
    loading,
    error,
    chatSessions,
    notifications,
    login,
    logout,
    setCurrentUser,
    showError,
    clearError,
    addChatSession,
    updateChatSession,
    addNotification,
    markNotificationRead,
    clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook personnalisé pour accéder au contexte
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
