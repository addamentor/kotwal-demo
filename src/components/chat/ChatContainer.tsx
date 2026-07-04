import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Conversation } from '@/types/chat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import WelcomeScreen from './WelcomeScreen';
import Sidebar from './Sidebar';
import DetectionNoticeBar, { DetectionNotice } from './DetectionNoticeBar';
import InspectionRail from './InspectionRail';
import {
  fetchChatModels,
  fetchChatResponse,
  fetchChatSession,
  fetchChatSessions,
  ChatModel,
  ChatSession,
  SensitiveDataInterceptError,
} from '@/services/chatApi';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const generateSessionId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h: string[] = [];
  for (let i = 0; i < 256; i += 1) h.push(i.toString(16).padStart(2, '0'));
  return (
    h[bytes[0]] + h[bytes[1]] + h[bytes[2]] + h[bytes[3]] + '-' +
    h[bytes[4]] + h[bytes[5]] + '-' +
    h[bytes[6]] + h[bytes[7]] + '-' +
    h[bytes[8]] + h[bytes[9]] + '-' +
    h[bytes[10]] + h[bytes[11]] + h[bytes[12]] + h[bytes[13]] + h[bytes[14]] + h[bytes[15]]
  );
};

const FALLBACK_MODELS: { value: string; label: string }[] = [
  { value: 'fallback-mini', label: 'Kotwal Mini · Fast' },
  { value: 'fallback-pro', label: 'Kotwal Pro · Balanced' },
  { value: 'fallback-ultra', label: 'Kotwal Ultra · Detailed' },
];

// DetectionNotice type is imported from DetectionNoticeBar (re-exported there).

const normalizeSessionMessages = (session: ChatSession): Message[] => {
  const rawMessages = (session.messages ?? []) as unknown[];
  if (!rawMessages.length) return [];
  const out: Message[] = [];
  rawMessages.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const r = entry as Record<string, unknown>;
    const baseId = (typeof r.id === 'string' && r.id) || `${session.sessionId}-${index}`;
    const tsSrc = r.timestamp ?? r.updatedAt ?? r.createdAt ?? new Date();
    const ts = tsSrc instanceof Date ? tsSrc : typeof tsSrc === 'string' ? new Date(tsSrc) : new Date();

    if ('role' in r && (r.role === 'user' || r.role === 'assistant')) {
      out.push({
        id: typeof r.id === 'string' ? r.id : baseId,
        role: r.role as 'user' | 'assistant',
        content: typeof r.content === 'string' ? r.content : '',
        timestamp: ts,
      });
      return;
    }
    if (typeof r.message === 'string') out.push({ id: `${baseId}-user`, role: 'user', content: r.message, timestamp: ts });
    if (typeof r.response === 'string') out.push({ id: `${baseId}-assistant`, role: 'assistant', content: r.response, timestamp: ts });
  });
  return out;
};

const ChatContainer = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelOptions, setModelOptions] = useState(FALLBACK_MODELS);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(FALLBACK_MODELS[0].value);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [notices, setNotices] = useState<DetectionNotice[]>([]);
  const [overrideReasonByNotice, setOverrideReasonByNotice] = useState<Record<string, string>>({});
  const [chatInputValue, setChatInputValue] = useState('');
  const [railCollapsed, setRailCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const hasInitializedHistory = useRef(false);
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [activeConversation?.messages, scrollToBottom]);

  const mapSessionToConversation = useCallback((session: ChatSession): Conversation => {
    const fallbackTitle =
      session.lastMessageAt || session.startedAt
        ? new Date(session.lastMessageAt ?? session.startedAt ?? new Date()).toLocaleString()
        : 'Previous chat';
    return {
      id: session.sessionId,
      sessionId: session.sessionId,
      title: session.title?.trim() || fallbackTitle,
      messages: normalizeSessionMessages(session),
      createdAt: session.startedAt ? new Date(session.startedAt) : new Date(),
      updatedAt: session.lastMessageAt ? new Date(session.lastMessageAt) : new Date(),
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    (async () => {
      setModelsLoading(true);
      try {
        const models = await fetchChatModels();
        if (!isMounted || !models.length) return;
        const opts = models.map((m: ChatModel) => ({ value: m.id, label: `${m.name} · ${m.provider}` }));
        setModelOptions(opts);
        setSelectedModel(opts[0].value);
      } catch (error) {
        toast({
          title: 'Unable to fetch models',
          description: error instanceof Error ? error.message : 'Try again later.',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) setModelsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    (async () => {
      try {
        const sessions = await fetchChatSessions();
        if (!isMounted) return;
        const mapped = sessions.map(mapSessionToConversation);
        setConversations((prev) => {
          const existing = new Set(prev.map((c) => c.id));
          const merged = [...mapped];
          prev.forEach((c) => { if (!existing.has(c.id)) merged.push(c); });
          return merged;
        });
        if (!hasInitializedHistory.current && mapped.length > 0) {
          setActiveConversationId((prev) => prev ?? mapped[0].id);
          hasInitializedHistory.current = true;
        }
      } catch (error) {
        toast({
          title: 'Unable to load history',
          description: error instanceof Error ? error.message : 'Please try again later.',
          variant: 'destructive',
        });
      }
    })();
    return () => { isMounted = false; };
  }, [token, mapSessionToConversation]);

  const createNewConversation = (firstMessage: string): Conversation => {
    const sessionId = generateSessionId();
    const title = firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '');
    const c: Conversation = {
      id: sessionId, sessionId, title, messages: [], createdAt: new Date(), updatedAt: new Date(),
    };
    setConversations((prev) => [c, ...prev]);
    setActiveConversationId(sessionId);
    return c;
  };

  const dismissNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    setOverrideReasonByNotice((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const clearAllNotices = useCallback(() => {
    setNotices([]);
    setOverrideReasonByNotice({});
  }, []);

  const handleSendMessage = async (
    content: string,
    options: { skipNotices?: boolean; overridePII?: boolean; overrideReason?: string } = {},
  ) => {
    let target = conversations.find((c) => c.id === activeConversationId) ?? null;
    if (!target) target = createNewConversation(content);
    const conversationId = target.id;
    const sessionId = target.sessionId ?? target.id;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) => c.id === conversationId
        ? { ...c, messages: [...c.messages, userMessage], updatedAt: new Date() }
        : c),
    );

    if (!options.skipNotices) {
      setChatInputValue('');
      setNotices([]);
      setOverrideReasonByNotice({});
    }
    setIsTyping(true);

    try {
      const result = await fetchChatResponse({
        modelId: selectedModel,
        message: content,
        sessionId,
        overridePII: options.overridePII ?? false,
        overrideReason: options.overrideReason,
      });

      await new Promise((r) => setTimeout(r, 200));
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.content,
        timestamp: new Date(),
      };
      setConversations((prev) =>
        prev.map((c) => c.id === conversationId
          ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date() }
          : c),
      );
    } catch (error) {
      if (error instanceof SensitiveDataInterceptError) {
        // Roll the user's prompt back out of the visible thread; show notice instead.
        setConversations((prev) =>
          prev.map((c) => c.id === conversationId
            ? { ...c, messages: c.messages.filter((m) => m.id !== userMessage.id), updatedAt: new Date() }
            : c),
        );
        if (!options.skipNotices) {
          const noticeId = `${Date.now()}`;
          setNotices((prev) => [{
            id: noticeId,
            userMessage: content,
            details: error.details,
            timestamp: new Date(),
          }, ...prev].slice(0, 3));
          setChatInputValue(content);
          setTimeout(() => chatInputRef.current?.focus(), 0);
        }
      } else {
        const fallback =
          "I'm having trouble reaching the Kotwal API right now. Please try again in a moment.";
        setConversations((prev) =>
          prev.map((c) => c.id === conversationId
            ? { ...c, messages: [...c.messages, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fallback,
                timestamp: new Date(),
              } as Message], updatedAt: new Date() }
            : c),
        );
        toast({
          title: 'Unable to reach Kotwal',
          description: error instanceof Error ? error.message : 'Unknown error.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleProceedAnyway = async (notice: DetectionNotice) => {
    const reason = (overrideReasonByNotice[notice.id] || '').trim();
    if (notice.details.requireOverrideReason && !reason) {
      toast({
        title: 'Reason required',
        description: 'Please describe why this prompt is safe to send before proceeding.',
        variant: 'destructive',
      });
      return;
    }
    dismissNotice(notice.id);
    await handleSendMessage(notice.userMessage, {
      skipNotices: true,
      overridePII: true,
      overrideReason: reason || undefined,
    });
  };

  const hydrateConversation = useCallback(
    async (sessionId: string) => {
      if (!token) return;
      setLoadingSessionId(sessionId);
      try {
        const session = await fetchChatSession(sessionId);
        if (!session) {
          toast({
            title: 'Session unavailable',
            description: 'Unable to fetch this chat session. Please try another one.',
            variant: 'destructive',
          });
          return;
        }
        const hydrated = mapSessionToConversation(session);
        setConversations((prev) => {
          const others = prev.filter((c) => c.id !== hydrated.id);
          return [hydrated, ...others];
        });
      } catch (error) {
        toast({
          title: 'Unable to load chat',
          description: error instanceof Error ? error.message : 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoadingSessionId((cur) => (cur === sessionId ? null : cur));
      }
    },
    [mapSessionToConversation, token],
  );

  const handleNewChat = () => {
    setActiveConversationId(null);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
    const existing = conversations.find((c) => c.id === id);
    if (!existing || existing.messages.length === 0) void hydrateConversation(id);
  };

  const hasMessages = Boolean(activeConversation && activeConversation.messages.length);
  const activeModelLabel = modelOptions.find((m) => m.value === selectedModel)?.label ?? null;
  const activeSessionId  = activeConversation?.sessionId ?? activeConversation?.id ?? null;
  const latestNotice     = notices[0] ?? null;
  const latestPolicyVer  = latestNotice?.details.policyVersion ?? null;

  return (
    <div className="chat-theme flex h-screen bg-background text-foreground">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        loadingSessionId={loadingSessionId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenDashboard={() => { setSidebarOpen(false); navigate('/dashboard'); }}
        userEmail={user?.email}
        userRole={user?.role}
        onLogout={async () => {
          setSidebarOpen(false);
          await logout();
          navigate('/demo');
        }}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-white via-white to-slate-50/60">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-10">
          <div className="pb-32 pt-10">
            <div className="max-w-3xl mx-auto px-4">
              {!hasMessages ? (
                <WelcomeScreen onSelectPrompt={(text) => {
                  setChatInputValue(text);
                  setTimeout(() => chatInputRef.current?.focus(), 0);
                }} />
              ) : (
                <div className="space-y-6">
                  {activeConversation?.messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      modelLabel={activeModelLabel}
                      isTyping={
                        isTyping && message.role === 'assistant' &&
                        index === (activeConversation?.messages.length ?? 0) - 1
                      }
                    />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Detection notices — extracted panel */}
        <DetectionNoticeBar
          notices={notices}
          overrideReasonByNotice={overrideReasonByNotice}
          onDismiss={dismissNotice}
          onDismissAll={clearAllNotices}
          onEditPrompt={(msg) => {
            setChatInputValue(msg);
            setTimeout(() => chatInputRef.current?.focus(), 0);
          }}
          onProceed={handleProceedAnyway}
          onReasonChange={(id, reason) =>
            setOverrideReasonByNotice((prev) => ({ ...prev, [id]: reason }))
          }
        />

        {/* Input */}
        <div className="sticky bottom-0 border-t border-white/70 bg-gradient-to-t from-white via-white to-white/60 px-3 pb-2 pt-4 sm:px-6">
          <ChatInput
            onSend={handleSendMessage}
            disabled={isTyping || modelsLoading}
            selectedModel={selectedModel}
            onChangeModel={setSelectedModel}
            modelOptions={modelOptions}
            value={chatInputValue}
            onInputChange={setChatInputValue}
            inputRef={chatInputRef}
          />
        </div>
      </main>

      {/* Right-hand inspection rail — shows what Kotwal saw on the last prompt */}
      <InspectionRail
        lastNotice={latestNotice}
        modelLabel={activeModelLabel}
        sessionId={activeSessionId}
        policyVersion={latestPolicyVer as number | string | null}
        collapsed={railCollapsed}
        onToggleCollapsed={() => setRailCollapsed((v) => !v)}
      />
    </div>
  );
};

export default ChatContainer;
