import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { chatsStaffApi } from '../../api/staff';
import PageHeader from '../../components/PageHeader';
import { formatDateTime } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function StaffChatsPage() {
  const { user } = useAuth();
  const { data: sessions, loading } = useApi(chatsStaffApi.getSessions);
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
      const res = await chatsStaffApi.getSession(session.chatId);
      setMessages(res.data?.data?.messages || res.data?.messages || []);
      await chatsStaffApi.markRead(session.chatId);
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
    setSending(true);
    try {
      await chatsStaffApi.sendMessage(activeChatIdRef.current, { message: msgInput }); // ✅ use ref
      setMessages(p => [
        ...p,
        {
          message: msgInput,
          senderId: user?.id,
          sentAt: new Date().toISOString(),
          senderName: 'You',
        },
      ]);
      setMsgInput('');
    } catch {
      toast.error('Failed to send.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader title="Patient Messages" subtitle="Chat sessions from patients about their bookings" />

      <div className="chat-container">

        {/* ── Sessions Sidebar ── */}
        <div className="chat-sessions">
          <div className="chat-sessions-header">
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>Conversations</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
              {sessions?.length || 0} sessions
            </div>
          </div>
          <div className="chat-sessions-list">
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <span className="spinner" />
              </div>
            ) : !sessions?.length ? (
              <div className="empty-state" style={{ padding: 32 }}>
                <div className="empty-state-icon">💬</div>
                <h3>No messages</h3>
              </div>
            ) : (
              sessions.map(s => (
                <div
                  key={s.chatId}
                  className={`chat-session-item ${activeSession?.chatId === s.chatId ? 'active' : ''}`}
                  onClick={() => loadSession(s)}
                >
                  <div className="chat-session-name">
                    {s.patientName || `Patient #${s.chatId}`}
                  </div>
                  <div className="chat-session-meta">
                    Booking #{s.bookingId} · {formatDateTime(s.lastMessageAt || s.createdAt)}
                  </div>
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
              <p>Choose a session from the left to view and reply.</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div style={{ fontWeight: 600 }}>
                  {activeSession.patientName || `Patient #${activeSession.chatId}`}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginLeft: 8 }}>
                  Booking #{activeSession.bookingId}
                </div>
              </div>

              <div className="chat-messages">
                {loadingMsgs ? (
                  <div style={{ textAlign: 'center' }}>
                    <span className="spinner" />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
                    No messages yet
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isMine = m.senderId === user?.id;
                    return (
                      <div key={i} className={`message-row ${isMine ? 'mine' : ''}`}>
                        <div>
                          <div className="message-bubble">{m.message || m.content}</div>
                          <div className="message-time" style={{ textAlign: isMine ? 'right' : 'left' }}>
                            {m.senderName || 'User'} · {formatDateTime(m.sentAt)}
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
                  placeholder="Type your reply…"
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