'use client';

import React, { useState, useEffect } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.pkctechs.in').replace(/\/$/, '');

const PRESETS = [
  {
    label: '🎉 Allotment Out',
    title: '🎉 Allotment Results Declared!',
    body: 'Registrar records are live. Tap to verify your allotment and refund status in 1-click.',
    data: { screen: 'ALLOTMENT_HUB' },
  },
  {
    label: '🚀 New IPO Live',
    title: '🚀 Bidding is Now Live!',
    body: 'Fresh IPO opened today with zero brokerage UPI bidding. Tap to view lot details & GMP.',
    data: { screen: 'HOME' },
  },
  {
    label: '⏰ Closing Soon',
    title: '⏰ Bidding Closes at 5:00 PM Today!',
    body: 'Final hours to submit your UPI mandate. Check latest subscription demand before applying.',
    data: { screen: 'HOME' },
  },
  {
    label: '📈 GMP Surge Alert',
    title: '📈 Grey Market Premium (GMP) Jumped!',
    body: 'Expected listing gain jumped to +45%! Tap to check live GMP trends and analysis.',
    data: { screen: 'HOME' },
  },
];

export default function NotificationAdminPage() {
  const [title, setTitle] = useState('🎉 Allotment Results Declared!');
  const [body, setBody] = useState('Official registrar results are now live. Tap to check your allotment status.');
  const [screenTarget, setScreenTarget] = useState('ALLOTMENT_HUB');
  const [stats, setStats] = useState({ totalSubscribers: 0, history: [] });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch subscriber count and broadcast history
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      let res;
      try {
        res = await fetch(`${API_BASE}/api/notifications/stats`);
      } catch (err) {
        if (API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1')) {
          res = await fetch('https://api.pkctechs.in/api/notifications/stats');
        } else {
          throw err;
        }
      }
      if (res && res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      }
    } catch {
      // Offline fallback: keep default stats state without error toast
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setBody(preset.body);
    if (preset.data?.screen) setScreenTarget(preset.data.screen);
  };

  const handleSendBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      setFeedback({ type: 'error', message: 'Please enter both Title and Body.' });
      return;
    }

    try {
      setIsSending(true);
      setFeedback(null);
      setShowConfirm(false);

      const res = await fetch(`${API_BASE}/api/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          data: { screen: screenTarget },
        }),
      });

      const json = await res.json();

      if (json.success) {
        setFeedback({
          type: 'success',
          message: `Broadcast sent! Delivered to ${json.recipientsCount} active device(s).`,
        });
        fetchStats();
      } else {
        setFeedback({ type: 'error', message: json.message || 'Failed to send broadcast.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Network error communicating with server.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <div style={styles.brandRow}>
            <div style={styles.brandBadge}>Banji</div>
            <h1 style={styles.headerTitle}>Push Notification Admin Panel</h1>
          </div>
          <p style={styles.headerSubtitle}>
            Broadcast live alerts to all mobile app users instantly without rebuilding the app.
          </p>
        </div>
      </header>

      <main style={styles.container}>
        {/* Metric Cards Row */}
        <section style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Active Mobile Devices</span>
            <div style={styles.metricValueRow}>
              <span style={styles.metricNumber}>
                {loadingStats ? '...' : stats.totalSubscribers}
              </span>
              <span style={styles.liveIndicator}>● Live</span>
            </div>
            <span style={styles.metricSub}>Devices registered to receive alerts</span>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Total Broadcasts Sent</span>
            <div style={styles.metricValueRow}>
              <span style={styles.metricNumber}>
                {loadingStats ? '...' : stats.history.length}
              </span>
            </div>
            <span style={styles.metricSub}>Recorded in system history</span>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Notification Gateway</span>
            <div style={styles.metricValueRow}>
              <span style={{ ...styles.metricNumber, color: '#10B981', fontSize: '20px' }}>
                Operational
              </span>
            </div>
            <span style={styles.metricSub}>Firebase Cloud Messaging (FCM) • High Priority</span>
          </div>
        </section>

        {/* Feedback Alert */}
        {feedback && (
          <div
            style={{
              ...styles.feedbackBox,
              backgroundColor: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              borderColor: feedback.type === 'success' ? '#10B981' : '#EF4444',
              color: feedback.type === 'success' ? '#065F46' : '#991B1B',
            }}
          >
            {feedback.type === 'success' ? '✓ ' : '✕ '}
            {feedback.message}
          </div>
        )}

        {/* Main Workspace Grid: Composer (Left) + Phone Preview (Right) */}
        <div style={styles.workspaceGrid}>
          {/* Form Composer Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Compose Message</h2>
            <p style={styles.cardDesc}>
              Craft real-time notifications for IPO openings, live GMP spikes, or registrar declarations.
            </p>

            {/* Quick Presets */}
            <div style={styles.presetsSection}>
              <span style={styles.presetLabel}>Quick Presets:</span>
              <div style={styles.presetsList}>
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    style={styles.presetBtn}
                    onClick={() => handleApplyPreset(p)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Notification Title</label>
                <span style={styles.charCount}>{title.length}/65</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🎉 Tata Tech IPO Allotment Out!"
                style={styles.input}
                maxLength={80}
              />
            </div>

            {/* Body Textarea */}
            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Notification Message Body</label>
                <span style={styles.charCount}>{body.length}/180</span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write the notification message here..."
                rows={3}
                style={styles.textarea}
                maxLength={220}
              />
            </div>

            {/* Screen Target */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Open Screen On Tap</label>
              <select
                value={screenTarget}
                onChange={(e) => setScreenTarget(e.target.value)}
                style={styles.select}
              >
                <option value="ALLOTMENT_HUB">Allotment Hub (PAN Checker Screen)</option>
                <option value="HOME">Home Screen (Live IPO Feed)</option>
              </select>
            </div>

            {/* Broadcast Action Button */}
            <div style={styles.actionRow}>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={isSending || !title.trim() || !body.trim()}
                style={{
                  ...styles.sendBtn,
                  opacity: isSending || !title.trim() || !body.trim() ? 0.6 : 1,
                  cursor: isSending ? 'not-allowed' : 'pointer',
                }}
              >
                {isSending ? 'Sending Broadcast...' : '🚀 Send Broadcast to All Users'}
              </button>
            </div>
          </div>

          {/* Live Mobile Phone Mockup Preview */}
          <div style={styles.previewCard}>
            <h3 style={styles.previewTitle}>Live Device Preview</h3>
            <p style={styles.previewDesc}>How your notification appears on users' Android & iOS devices:</p>

            <div style={styles.phoneFrame}>
              <div style={styles.phoneSpeaker} />
              
              <div style={styles.notificationBanner}>
                <div style={styles.bannerHeader}>
                  <div style={styles.bannerAppIcon}>B</div>
                  <span style={styles.bannerAppName}>Banji</span>
                  <span style={styles.bannerDot}>•</span>
                  <span style={styles.bannerTime}>now</span>
                </div>
                <div style={styles.bannerTitle}>{title || 'Your Notification Title'}</div>
                <div style={styles.bannerBody}>{body || 'Your notification body preview will appear right here.'}</div>
              </div>

              <div style={styles.phoneHomeBar} />
            </div>
          </div>
        </div>

        {/* History Table */}
        <section style={styles.historySection}>
          <div style={styles.historyHeader}>
            <h2 style={styles.cardTitle}>Recent Broadcast History</h2>
            <button type="button" style={styles.refreshBtn} onClick={fetchStats}>
              ↻ Refresh
            </button>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Message Body</th>
                  <th style={styles.th}>Sent Date</th>
                  <th style={styles.th}>Delivered</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.history.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyTd}>
                      No broadcast notifications sent yet. Use the composer above to send your first message.
                    </td>
                  </tr>
                ) : (
                  stats.history.map((item, idx) => (
                    <tr key={item._id || idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: '600' }}>{item.title}</td>
                      <td style={styles.td}>{item.body}</td>
                      <td style={styles.td}>
                        {new Date(item.sentAt).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700', color: '#2563EB' }}>
                        {item.recipientsCount} devices
                      </td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge}>Sent</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Confirm Broadcast</h3>
            <p style={styles.modalText}>
              Are you sure you want to send this notification to <strong>all {stats.totalSubscribers} active mobile devices</strong>?
            </p>
            <div style={styles.modalPreview}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>{title}</div>
              <div style={{ fontSize: '13px', color: '#4B5563' }}>{body}</div>
            </div>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={styles.confirmSendBtn}
                onClick={handleSendBroadcast}
              >
                Yes, Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    padding: '24px 20px',
  },
  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '6px',
  },
  brandBadge: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    padding: '4px 10px',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13px',
    letterSpacing: '0.5px',
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: '800',
    margin: 0,
    color: '#0F172A',
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#64748B',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '28px 20px 60px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  metricLabel: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#64748B',
  },
  metricValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '6px',
    marginBottom: '4px',
  },
  metricNumber: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0F172A',
  },
  liveIndicator: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#10B981',
  },
  metricSub: {
    fontSize: '12px',
    color: '#94A3B8',
  },
  feedbackBox: {
    padding: '14px 18px',
    borderRadius: '10px',
    border: '1px solid',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600',
  },
  workspaceGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '24px',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '800',
    margin: '0 0 6px 0',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#64748B',
    margin: '0 0 18px 0',
  },
  presetsSection: {
    marginBottom: '18px',
  },
  presetLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748B',
    display: 'block',
    marginBottom: '8px',
  },
  presetsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  presetBtn: {
    backgroundColor: '#F1F5F9',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  fieldGroup: {
    marginBottom: '18px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#334155',
  },
  charCount: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
    fontFamily: 'inherit',
  },
  actionRow: {
    marginTop: '24px',
  },
  sendBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '700',
    border: 'none',
    boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: '16px',
    fontWeight: '800',
    margin: '0 0 4px 0',
  },
  previewDesc: {
    fontSize: '12px',
    color: '#64748B',
    margin: '0 0 20px 0',
    textAlign: 'center',
  },
  phoneFrame: {
    width: '300px',
    height: '420px',
    borderRadius: '36px',
    backgroundColor: '#0F172A',
    border: '6px solid #1E293B',
    padding: '16px 12px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  phoneSpeaker: {
    width: '50px',
    height: '4px',
    backgroundColor: '#334155',
    borderRadius: '2px',
    marginBottom: '24px',
  },
  notificationBanner: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    padding: '12px 14px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
  },
  bannerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  bannerAppIcon: {
    width: '18px',
    height: '18px',
    borderRadius: '5px',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerAppName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#1E293B',
  },
  bannerDot: {
    fontSize: '10px',
    color: '#94A3B8',
  },
  bannerTime: {
    fontSize: '11px',
    color: '#64748B',
  },
  bannerTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '2px',
  },
  bannerBody: {
    fontSize: '12px',
    color: '#475569',
    lineHeight: '16px',
  },
  phoneHomeBar: {
    position: 'absolute',
    bottom: '12px',
    width: '100px',
    height: '4px',
    backgroundColor: '#475569',
    borderRadius: '2px',
  },
  historySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #E2E8F0',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  refreshBtn: {
    backgroundColor: '#F1F5F9',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  thRow: {
    borderBottom: '2px solid #E2E8F0',
  },
  th: {
    textAlign: 'left',
    padding: '10px 14px',
    color: '#64748B',
    fontWeight: '700',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '12px 14px',
    color: '#334155',
  },
  emptyTd: {
    padding: '30px',
    textAlign: 'center',
    color: '#94A3B8',
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: '18px',
    padding: '26px',
    maxWidth: '440px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '800',
    margin: '0 0 8px 0',
  },
  modalText: {
    fontSize: '14px',
    color: '#475569',
    margin: '0 0 16px 0',
    lineHeight: '20px',
  },
  modalPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    padding: '14px',
    border: '1px solid #E2E8F0',
    marginBottom: '20px',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  confirmSendBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};
