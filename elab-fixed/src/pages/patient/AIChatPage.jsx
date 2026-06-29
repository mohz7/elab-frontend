import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { aiChatApi } from '../../api/patient';
import PageHeader from '../../components/PageHeader';
import { formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AIChatPage() {
  const { data: sessions, loading } = useApi(aiChatApi.getSessions);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [msgInput, setMsgInput]           = useState('');
  const [sending, setSending]             = useState(false);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const bottomRef       = useRef(null);
  const activeChatIdRef = useRef(null); // ✅ never stale in closures

  // ─── Load session ──────────────────────────────────────────────────────────
  const loadSession = async (session) => {
    if (!session?.aiChatId) {               // ✅ aiChatId
      toast.error('Invalid session.');
      return;
    }
    activeChatIdRef.current = session.aiChatId; // ✅ set ref first
    setActiveSession(session);
    setLoadingMsgs(true);
    try {
      const res = await aiChatApi.getSession(session.aiChatId); // ✅ aiChatId
      const data = res.data?.data ?? res.data;
      setMessages(data?.messages || []);
    } catch {
      toast.error('Failed to load session.');
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!msgInput.trim() || !activeChatIdRef.current) return; // ✅ use ref
    const userMsg = msgInput.trim();
    setMsgInput('');

    // Optimistic: show user message immediately
    setMessages(p => [...p, {
      role: 'User',
      message: userMsg,
      sentAt: new Date().toISOString(),
    }]);

    setSending(true);
    try {
      const res = await aiChatApi.sendMessage(activeChatIdRef.current, { message: userMsg }); // ✅ use ref
      // Backend returns: { userMessage: {...}, aiResponse: {...} }
      const data = res.data?.data ?? res.data;
      const aiReply = data?.aiResponse ?? data?.aIResponse;
      if (aiReply) {
        setMessages(p => [...p, {
          role: 'Assistant',
          message: aiReply.message,
          sentAt: aiReply.sentAt || new Date().toISOString(),
        }]);
      }
    } catch {
      toast.error('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader title="AI Analysis" subtitle="Get AI-powered explanations of your lab results" />

      <div className="chat-container" style={{ height: 'calc(100vh - 180px)' }}>

        {/* ── Sessions Sidebar ── */}
        <div className="chat-sessions">
          <div className="chat-sessions-header">
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>AI Sessions</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Based on your results</div>
          </div>
          <div className="chat-sessions-list">
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <span className="spinner" />
              </div>
            ) : !sessions?.length ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="empty-state-icon">🤖</div>
                <h3 style={{ fontSize: 14 }}>No sessions yet</h3>
                <p style={{ fontSize: 12 }}>Start an AI session from your results page.</p>
              </div>
            ) : (
              sessions.map(s => (
                <div
                  key={s.aiChatId}                                              // ✅ aiChatId
                  className={`chat-session-item ${activeSession?.aiChatId === s.aiChatId ? 'active' : ''}`} // ✅ aiChatId
                  onClick={() => loadSession(s)}
                >
                  <div className="chat-session-name">
                    {s.testName || `Result #${s.resultId}`}
                  </div>
                  <div className="chat-session-meta">
                    {formatDateTime(s.startedAt || s.createdAt)}
                  </div>
                  {s.totalMessages > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                      {s.totalMessages} message{s.totalMessages !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Main Chat Area ── */}
        <div className="chat-main">
          {!activeSession ? (
            <div className="empty-state" style={{ flex: 1, justifyContent: 'center' }}>
              <div className="empty-state-icon">🤖</div>
              <h3>AI Medical Assistant</h3>
              <p>Select an AI session to ask questions about your lab results.</p>
              <div style={{
                marginTop: 20, padding: 16,
                background: 'var(--teal-glow)',
                borderRadius: 'var(--radius)',
                border: '1px solid rgba(0,201,167,0.2)',
                maxWidth: 320, textAlign: 'left',
              }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--teal-700)', marginBottom: 8 }}>
                  What can I ask?
                </div>
                {[
                  'Explain what my results mean',
                  'Are my values within normal range?',
                  'What symptoms should I watch for?',
                  'Should I be concerned about these values?',
                ].map(q => (
                  <div key={q} style={{ fontSize: 12.5, color: 'var(--gray-600)', marginBottom: 4 }}>
                    • {q}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div style={{
                  width: 32, height: 32,
                  background: 'var(--navy-900)', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  🤖
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>AI Medical Assistant</div>
                  <div style={{ fontSize: 11.5, color: 'var(--gray-400)' }}>
                    {activeSession.testName || `Result #${activeSession.resultId}`} · Powered by Gemini AI
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {/* Welcome message when no messages yet */}
                {messages.length === 0 && !loadingMsgs && (
                  <div className="message-row">
                    <div>
                      <div className="message-bubble ai-message-bubble">
                        👋 Hello! I'm your AI medical assistant. I've analyzed your lab result and I'm ready to answer your questions. What would you like to know?
                      </div>
                    </div>
                  </div>
                )}

                {loadingMsgs ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <span className="spinner" />
                  </div>
                ) : (
                  messages.map((m, i) => {
                    // ✅ backend returns role as "User" / "Assistant" string
                    const isAI = m.role === 'Assistant' || m.role === 'assistant';
                    return (
                      <div key={i} className={`message-row ${!isAI ? 'mine' : ''}`}>
                        <div>
                          {isAI && (
                            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 3 }}>
                              🤖 AI Assistant
                            </div>
                          )}
                          <div
                            className={`message-bubble ${isAI ? 'ai-message-bubble' : ''}`}
                            style={{ whiteSpace: 'pre-wrap' }}
                          >
                            {m.message || m.content}
                          </div>
                          <div className="message-time" style={{ textAlign: isAI ? 'left' : 'right' }}>
                            {formatDateTime(m.sentAt || m.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* AI typing indicator */}
                {sending && (
                  <div className="message-row">
                    <div className="message-bubble ai-message-bubble"
                      style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="spinner"
                        style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                      <span style={{ fontSize: 13 }}>Analyzing…</span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="chat-input-area">
                <input
                  placeholder="Ask about your lab results…"
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !sending && handleSend()}
                  disabled={sending}
                />
                <button
                  className="btn btn-dark"
                  onClick={handleSend}
                  disabled={sending || !msgInput.trim()}
                >
                  {sending ? <span className="spinner" /> : 'Ask AI'}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}