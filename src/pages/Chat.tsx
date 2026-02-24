import { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { Bot, RefreshCw, WifiOff, Menu, MessageSquarePlus } from 'lucide-react';
import { chatWithBotCloud } from '@/services/api';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface ConversationContext {
  previousMessages: Array<{ role: string; content: string }>;
  topics: string[];
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Composant interne qui utilise le ChatContext
const ChatContent = () => {
  const { currentUser } = useApp();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    currentSession,
    currentSessionId,
    addMessage,
    createNewSession,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isTyping, setIsTyping] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    previousMessages: [],
    topics: [],
  });

  // Messages de la session courante
  const messages = currentSession?.messages || [];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Réinitialiser le contexte quand on change de session
  useEffect(() => {
    if (currentSession) {
      const prevMessages = currentSession.messages
        .filter(m => m.id !== '1') // Exclure le message de bienvenue
        .map(m => ({
          role: m.isUser ? 'user' : 'assistant',
          content: m.text,
        }));
      setConversationContext({
        previousMessages: prevMessages,
        topics: [],
      });
    }
  }, [currentSessionId]);

  const sendMessageWithRetry = async (
    text: string,
    retryCount = 0
  ): Promise<{ success: boolean; response?: string }> => {
    const result = await chatWithBotCloud(text, {
      previousMessages: conversationContext.previousMessages.slice(-10),
      topics: conversationContext.topics,
    });
    if (result.success && result.data) {
      return { success: true, response: result.data.response };
    } else {
      if (retryCount < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return sendMessageWithRetry(text, retryCount + 1);
      }
      throw new Error(result.error || 'Erreur de communication avec EduBot');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentSessionId) {
      createNewSession();
      return;
    }

    if (isOffline) {
      toast({
        title: 'Hors ligne',
        description: 'Vérifiez votre connexion internet et réessayez.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    addMessage(currentSessionId, userMessage);
    setIsTyping(true);
    setIsError(false);
    setLastFailedMessage(null);

    try {
      const result = await sendMessageWithRetry(text);

      if (result.success && result.response) {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          text: result.response,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        };

        addMessage(currentSessionId, aiResponse);

        // Update conversation context
        setConversationContext((prev) => ({
          previousMessages: [
            ...prev.previousMessages,
            { role: 'user', content: text },
            { role: 'assistant', content: result.response! },
          ].slice(-20),
          topics: prev.topics,
        }));
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsError(true);
      setLastFailedMessage(text);

      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de joindre EduBot. Le serveur est peut-être indisponible.',
        variant: 'destructive',
      });

      // Add error message to chat
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je n'ai pas pu traiter ta demande. Le serveur semble indisponible. Clique sur 'Réessayer' pour renvoyer ton message.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      addMessage(currentSessionId, errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage && currentSessionId) {
      // Le message d'erreur est déjà dans les messages, on renvoie juste
      handleSendMessage(lastFailedMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Navigation />

      <div className="flex-1 pt-16 flex">
        {/* Sidebar */}
        <ChatSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
            {/* Bouton menu mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Toggle sidebar desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-lg truncate">
                {currentSession?.title || 'EduBot'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isOffline ? (
                  <span className="flex items-center gap-1 text-destructive">
                    <WifiOff className="w-3 h-3" /> Hors ligne
                  </span>
                ) : isTyping ? (
                  "En train d'écrire..."
                ) : (
                  'En ligne'
                )}
              </p>
            </div>

            {/* Nouveau chat rapide */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => createNewSession()}
              title="Nouvelle conversation"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </Button>

            {currentUser && (
              <span className="hidden sm:inline-block text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full">
                {currentUser.name}
              </span>
            )}
          </div>

          {/* Offline Banner */}
          {isOffline && (
            <div className="bg-destructive/10 border-b border-destructive/20 p-3 flex items-center justify-center gap-2">
              <WifiOff className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">
                Vous êtes hors ligne. Vérifiez votre connexion internet.
              </p>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}

              {isTyping && (
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        EduBot est en train d'écrire...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Retry Button */}
              {isError && lastFailedMessage && (
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                  </Button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-background/80 backdrop-blur-sm p-4">
            <div className="max-w-3xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} disabled={isTyping || isOffline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal qui wrap avec le provider
const Chat = () => {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
};

export default Chat;
