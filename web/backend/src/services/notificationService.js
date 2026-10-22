const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');
const fs = require('fs');
const { PushToken } = require('../models/PushNotification');
const User = require('../models/User');

let messagingInstance = null;

/**
 * Initialize Firebase Admin SDK using serviceAccountKey.json
 */
function getMessagingService() {
  if (messagingInstance) return messagingInstance;

  try {
    let serviceAccount = null;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        let raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
        // Handle case if value was wrapped in extra quotes
        if (raw.startsWith('"') && raw.endsWith('"')) {
          try {
            raw = JSON.parse(raw);
          } catch (_) {}
        }
        serviceAccount = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (serviceAccount && serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
      } catch (parseErr) {
        console.error('[FCM] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', parseErr.message);
      }
    }

    if (!serviceAccount) {
      const serviceAccountPath =
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        path.join(__dirname, '../../serviceAccountKey.json');

      if (fs.existsSync(serviceAccountPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      } else {
        console.warn(`[FCM] Warning: serviceAccountKey.json not found at ${serviceAccountPath}`);
      }
    }

    if (serviceAccount) {
      const apps = getApps();
      const app = apps.length > 0
        ? apps[0]
        : initializeApp({
            credential: cert(serviceAccount),
          });

      messagingInstance = getMessaging(app);
      console.log(`[FCM] Firebase Messaging initialized for project: ${serviceAccount.project_id}`);
    }
  } catch (err) {
    console.error('[FCM] Error initializing Firebase Admin SDK:', err.message);
  }

  return messagingInstance;
}

// Auto-initialize on module load
getMessagingService();

/**
 * Send a Broadcast Push Notification to ALL mobile devices via FCM topic
 * @param {object} payload - { title, body, data }
 */
async function sendBroadcast({ title, body, data = {} }) {
  const messaging = getMessagingService();
  if (!messaging) {
    throw new Error('Firebase Messaging is not initialized. Please verify serviceAccountKey.json exists.');
  }

  // FCM data values MUST be strings
  const stringData = {};
  if (data && typeof data === 'object') {
    for (const [k, v] of Object.entries(data)) {
      stringData[k] = typeof v === 'string' ? v : JSON.stringify(v);
    }
  }

  const message = {
    topic: 'all_users',
    notification: {
      title,
      body,
    },
    data: stringData,
    android: {
      priority: 'high',
      ttl: 86400 * 1000, // 24 hours in milliseconds
      notification: {
        channelId: 'high_importance_channel',
        priority: 'max',
        defaultSound: true,
        defaultVibrateTimings: true,
        visibility: 'public',
      },
    },
    apns: {
      headers: {
        'apns-priority': '10',
      },
      payload: {
        aps: {
          alert: {
            title,
            body,
          },
          sound: 'default',
          badge: 1,
          contentAvailable: true,
        },
      },
    },
  };

  const response = await messaging.send(message);
  console.log(`[FCM] Broadcast sent to topic "all_users". Message ID: ${response}`);
  return response;
}

/**
 * Send targeted push notification to specific FCM device tokens
 */
async function sendToTokens(tokens, title, body, data = {}) {
  const messaging = getMessagingService();
  if (!messaging || !tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  const stringData = {};
  if (data && typeof data === 'object') {
    for (const [k, v] of Object.entries(data)) {
      stringData[k] = typeof v === 'string' ? v : JSON.stringify(v);
    }
  }

  const batchSize = 500;
  let totalSuccess = 0;
  let totalFailure = 0;
  const invalidTokens = [];

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);
    const response = await messaging.sendEachForMulticast({
      tokens: batch,
      notification: { title, body },
      data: stringData,
      android: {
        priority: 'high',
        ttl: 86400 * 1000,
        notification: {
          channelId: 'high_importance_channel',
          priority: 'max',
          defaultSound: true,
          defaultVibrateTimings: true,
          visibility: 'public',
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            alert: { title, body },
            sound: 'default',
            badge: 1,
            contentAvailable: true,
          },
        },
      },
    });

    totalSuccess += response.successCount;
    totalFailure += response.failureCount;

    // Collect invalid tokens for auto-cleanup
    response.responses.forEach((res, idx) => {
      if (!res.success) {
        const errCode = res.error?.code;
        if (
          errCode === 'messaging/invalid-registration-token' ||
          errCode === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(batch[idx]);
        }
      }
    });
  }

  // Clean up stale tokens from database
  if (invalidTokens.length > 0) {
    await PushToken.deleteMany({ token: { $in: invalidTokens } }).catch((e) =>
      console.warn('[FCM] Error pruning stale tokens:', e.message)
    );
  }

  return { successCount: totalSuccess, failureCount: totalFailure };
}

/**
 * Sends a notification to ALL registered users
 */
async function notifyAllUsers(title, body, data = {}) {
  try {
    return await sendBroadcast({ title, body, data });
  } catch (error) {
    console.error('[FCM] notifyAllUsers error:', error.message);
    throw error;
  }
}

/**
 * Sends a notification to specific users based on their stored PAN numbers
 */
async function notifyUsersByPan(panNumbers, title, body, data = {}) {
  try {
    const upperPans = panNumbers.map((p) => p.toUpperCase());
    const users = await User.find({
      'pans.panNumber': { $in: upperPans },
    }).lean();

    const userIds = users.map((u) => u._id.toString());
    const tokenDocs = await PushToken.find({ userId: { $in: userIds } }).lean();
    const tokens = tokenDocs.map((t) => t.token);

    if (tokens.length > 0) {
      return await sendToTokens(tokens, title, body, data);
    }
    return { successCount: 0, failureCount: 0 };
  } catch (error) {
    console.error('[FCM] notifyUsersByPan error:', error.message);
    return { successCount: 0, failureCount: 0 };
  }
}

module.exports = {
  getMessagingService,
  sendBroadcast,
  sendToTokens,
  notifyAllUsers,
  notifyUsersByPan,
};
