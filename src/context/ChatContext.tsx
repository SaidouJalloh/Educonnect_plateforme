import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types pour les messages et sessions
export interface ChatMessageAttachment {
  name: string;
  type: 'image' | 'audio' | 'file';
  url?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  attachments?: ChatMessageAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  icon: string;
}

interface ChatContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentSession: ChatSession | null;
  isLoading: boolean;
  createNewSession: () => string;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateSessionTitle: (id: string, title: string) => void;
  togglePinSession: (id: string) => void;
  searchSessions: (query: string) => ChatSession[];
  resetToHome: () => void;
  getSessionsByDate: () => {
    today: ChatSession[];
    yesterday: ChatSession[];
    thisWeek: ChatSession[];
    older: ChatSession[];
  };
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'edubot_chat_sessions';
const CURRENT_SESSION_KEY = 'edubot_current_session';

// Génère un titre automatique basé sur le premier message
const generateTitle = (message: string): string => {
  const cleanMessage = message.trim().slice(0, 30);
  return cleanMessage.length < message.length ? `${cleanMessage}...` : cleanMessage;
};

// Détermine l'icône basée sur le contenu
const getIconForMessage = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('bourse') || lowerMessage.includes('financement')) return '🎓';
  if (lowerMessage.includes('université') || lowerMessage.includes('école')) return '🏫';
  if (lowerMessage.includes('travail') || lowerMessage.includes('emploi') || lowerMessage.includes('stage')) return '💼';
  if (lowerMessage.includes('statistique') || lowerMessage.includes('données')) return '📊';
  if (lowerMessage.includes('formation') || lowerMessage.includes('cours')) return '📚';
  if (lowerMessage.includes('pays') || lowerMessage.includes('voyage') || lowerMessage.includes('étranger')) return '🌍';
  return '💬';
};

// Message de bienvenue par défaut
const createWelcomeMessage = (): ChatMessage => ({
  id: '1',
  text: "Bonjour ! Je suis EduBot, ton assistant pour l'orientation scolaire en Afrique. Comment puis-je t'aider aujourd'hui ?",
  isUser: false,
  timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
});

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les sessions depuis localStorage au montage
  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(STORAGE_KEY);
      const storedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY);
      
      if (storedSessions) {
        const parsed = JSON.parse(storedSessions);
        setSessions(parsed);
        
        // Restaurer la session courante ou utiliser la plus récente
        if (storedCurrentId && parsed.find((s: ChatSession) => s.id === storedCurrentId)) {
          setCurrentSessionId(storedCurrentId);
        } else if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
        }
      } else {
        // Première utilisation : créer une session par défaut
        const defaultSession: ChatSession = {
          id: Date.now().toString(),
          title: 'Nouvelle conversation',
          messages: [createWelcomeMessage()],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPinned: false,
          icon: '💬',
        };
        setSessions([defaultSession]);
        setCurrentSessionId(defaultSession.id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder les sessions dans localStorage à chaque changement
  useEffect(() => {
    if (!isLoading && sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, isLoading]);

  // Sauvegarder l'ID de session courante
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, currentSessionId);
    }
  }, [currentSessionId]);

  // Session courante
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  // Créer une nouvelle session
  const createNewSession = useCallback((): string => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Nouvelle conversation',
      messages: [createWelcomeMessage()],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      icon: '💬',
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, []);

  // Changer de session
  const switchSession = useCallback((id: string) => {
    if (sessions.find(s => s.id === id)) {
      setCurrentSessionId(id);
    }
  }, [sessions]);

  // Supprimer une session
  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      
      // Si on supprime la session courante, passer à une autre
      if (id === currentSessionId) {
        if (filtered.length > 0) {
          setCurrentSessionId(filtered[0].id);
        } else {
          // Créer une nouvelle session si plus aucune
          const newSession: ChatSession = {
            id: Date.now().toString(),
            title: 'Nouvelle conversation',
            messages: [createWelcomeMessage()],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPinned: false,
            icon: '💬',
          };
          setCurrentSessionId(newSession.id);
          return [newSession];
        }
      }
      
      return filtered;
    });
  }, [currentSessionId]);

  // Ajouter un message à une session
  const addMessage = useCallback((sessionId: string, message: ChatMessage) => {
    setSessions(prev => prev.map(session => {
      if (session.id !== sessionId) return session;

      const updatedMessages = [...session.messages, message];
      
      // Mettre à jour le titre et l'icône après le premier message utilisateur
      const userMessages = updatedMessages.filter(m => m.isUser);
      let newTitle = session.title;
      let newIcon = session.icon;
      
      if (userMessages.length === 1 && message.isUser) {
        newTitle = generateTitle(message.text);
        newIcon = getIconForMessage(message.text);
      }

      return {
        ...session,
        messages: updatedMessages,
        title: newTitle,
        icon: newIcon,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  // Mettre à jour le titre d'une session
  const updateSessionTitle = useCallback((id: string, title: string) => {
    setSessions(prev => prev.map(session => 
      session.id === id 
        ? { ...session, title, updatedAt: new Date().toISOString() }
        : session
    ));
  }, []);

  // Revenir à l'accueil (déselectionner la session)
  const resetToHome = useCallback(() => {
    setCurrentSessionId(null);
  }, []);

  // Épingler/désépingler une session
  const togglePinSession = useCallback((id: string) => {
    setSessions(prev => {
      const updated = prev.map(session =>
        session.id === id
          ? { ...session, isPinned: !session.isPinned, updatedAt: new Date().toISOString() }
          : session
      );
      // Trier : épinglées en premier, puis par date
      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });
  }, []);

  // Rechercher dans les sessions
  const searchSessions = useCallback((query: string): ChatSession[] => {
    if (!query.trim()) return sessions;
    
    const lowerQuery = query.toLowerCase();
    return sessions.filter(session => {
      // Chercher dans le titre
      if (session.title.toLowerCase().includes(lowerQuery)) return true;
      // Chercher dans les messages
      return session.messages.some(m => m.text.toLowerCase().includes(lowerQuery));
    });
  }, [sessions]);

  // Grouper les sessions par date
  const getSessionsByDate = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const result = {
      today: [] as ChatSession[],
      yesterday: [] as ChatSession[],
      thisWeek: [] as ChatSession[],
      older: [] as ChatSession[],
    };

    // Trier par épinglé puis par date
    const sortedSessions = [...sessions].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    sortedSessions.forEach(session => {
      const sessionDate = new Date(session.updatedAt);
      
      if (sessionDate >= today) {
        result.today.push(session);
      } else if (sessionDate >= yesterday) {
        result.yesterday.push(session);
      } else if (sessionDate >= weekAgo) {
        result.thisWeek.push(session);
      } else {
        result.older.push(session);
      }
    });

    return result;
  }, [sessions]);

  const value: ChatContextType = {
    sessions,
    currentSessionId,
    currentSession,
    isLoading,
    createNewSession,
    switchSession,
    deleteSession,
    addMessage,
    updateSessionTitle,
    togglePinSession,
    searchSessions,
    resetToHome,
    getSessionsByDate,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat doit être utilisé dans un ChatProvider');
  }
  return context;
};
