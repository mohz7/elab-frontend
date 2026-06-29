import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { chatsPatientApi } from '../../api/patient';
import PageHeader from '../../components/PageHeader';
import { formatDateTime } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function PatientChatsPage() {
  const { user } = useAuth();
  const { data: sessions, loading } = useApi(chatsPatientApi.getSessions);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [msgInput, setMsgInput]           = useState('');
  const [sending, setSending]             = useState(false);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const bottomRef       = useRef(null);
  const activeChatIdRef = useRef(null); // ✅ always fresh — never stale in closures

  const loadSession = async (session) => {
    if (!session?.chatId) {
      toast.error('Invalid session.');
      return;
    }
    activeChatIdRef.current = session.chatId; // ✅ set ref first
    setActiveSession(session);
    setLoadingMsgs(true);
    try {
      const res = await chatsPatientApi.getSession(session.chatId);
      const data = res.data?.data ?? res.data;
      setMessages(data?.messages || []);
      await chatsPatientApi.markRead(session.chatId);
    } catch {
      toast.error('Failed to load messages.');
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!msgInput.trim() || !activeChatIdRef.current) return; // ✅ use ref
    const content = msgInput.trim();
    setMsgInput('');
    setMessages(p => [
      ...p,
      {
        message: content,
        senderId: user?.id,
        sentAt: new Date().toISOString(),
        senderName: 'You',
      },
    ]);
    setSending(true);
    try {
      await chatsPatientApi.sendMessage(activeChatIdRef.current, { message: content }); // ✅ use ref
    } catch {
      toast.error('Failed to send.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader title="Staff Messages" subtitle="Chat with lab staff about your bookings" />

      <div className="chat-container" style={{ height: 'calc(100vh - 180px)' }}>

        {/* ── Sessions Sidebar ── */}
        <div className="chat-sessions">
          <div className="chat-sessions-header">
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>My Conversations</div>
          </div>
          <div className="chat-sessions-list">
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <span className="spinner" />
              </div>
            ) : !sessions?.length ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <div className="empty-state-icon">💬</div>
                <h3 style={{ fontSize: 14 }}>No chats yet</h3>
                <p style={{ fontSize: 12 }}>Start a chat from your results page.</p>
              </div>
            ) : (
              sessions.map(s => (
                <div
                  key={s.chatId}
                  className={`chat-session-item ${activeSession?.chatId === s.chatId ? 'active' : ''}`}
                  onClick={() => loadSession(s)}
                >
                  <div className="chat-session-name">Booking #{s.bookingId}</div>
                  <div className="chat-session-meta">
                    {formatDateTime(s.lastMessageAt || s.createdAt)}
                  </div>
                  {s.unreadCount > 0 && (
                    <span style={{
                      display: 'inline-block', marginTop: 4,
                      background: 'var(--teal-500)', color: 'white',
                      borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700,
                    }}>
                      {s.unreadCount} new
                    </span>
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
              <div className="empty-state-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a booking chat session from the left panel.</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div style={{ fontWeight: 600 }}>Booking #{activeSession.bookingId}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>
                  {activeSession.staffName ? `with ${activeSession.staffName}` : 'Lab Staff'}
                </div>
              </div>

              <div className="chat-messages">
                {loadingMsgs ? (
                  <div style={{ textAlign: 'center' }}>
                    <span className="spinner" />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 13, padding: 20 }}>
                    No messages yet. Say hello! 👋
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isMine = m.senderId === user?.id;
                    return (
                      <div key={i} className={`message-row ${isMine ? 'mine' : ''}`}>
                        <div>
                          {!isMine && (
                            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 3 }}>
                              {m.senderName || 'Staff'}
                            </div>
                          )}
                          <div className="message-bubble">{m.message || m.content}</div>
                          <div className="message-time" style={{ textAlign: isMine ? 'right' : 'left' }}>
                            {formatDateTime(m.sentAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="chat-input-area">
                <input
                  placeholder="Type a message…"
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={sending || !msgInput.trim()}
                >
                  {sending ? <span className="spinner" /> : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}