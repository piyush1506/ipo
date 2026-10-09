const axios = require('axios');
const User = require('../models/User');

/**
 * Sends a push notification via Expo Push API
 * @param {Array<string>} pushTokens Array of Expo Push Tokens
 * @param {string} title Notification Title
 * @param {string} body Notification Body
 * @param {object} data Optional custom data payload
 */
async function sendPushNotification(pushTokens, title, body, data = {}) {
  // Filter out invalid tokens
  const validTokens = pushTokens.filter(token => 
    token && token.startsWith('ExponentPushToken[')
  );

  if (validTokens.length === 0) return;

  const messages = validTokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  try {
    const response = await axios.post('https://exp.host/--/api/v2/push/send', messages, {
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      }
    });

    console.log('Successfully sent push notifications:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending push notifications:', error.response?.data || error.message);
  }
}

/**
 * Sends a notification to ALL registered users
 */
async function notifyAllUsers(title, body, data = {}) {
  try {
    // Find all users who have an expoPushToken
    const users = await User.find({ expoPushToken: { $exists: true, $ne: null } }).lean();
    const tokens = users.map(user => user.expoPushToken);
    
    if (tokens.length > 0) {
      await sendPushNotification(tokens, title, body, data);
    }
    return tokens.length;
  } catch (error) {
    console.error('Failed to notify all users:', error);
    return 0;
  }
}

/**
 * Sends a notification to specific users based on their stored PAN numbers.
 * Useful for when an allotment comes out for a specific PAN.
 */
async function notifyUsersByPan(panNumbers, title, body, data = {}) {
  try {
    // Find users who have at least one of these PAN numbers
    const users = await User.find({
      'pans.panNumber': { $in: panNumbers.map(p => p.toUpperCase()) },
      expoPushToken: { $exists: true, $ne: null }
    }).lean();

    const tokens = users.map(user => user.expoPushToken);
    
    if (tokens.length > 0) {
      await sendPushNotification(tokens, title, body, data);
    }
    return tokens.length;
  } catch (error) {
    console.error('Failed to notify by PAN:', error);
    return 0;
  }
}

module.exports = {
  sendPushNotification,
  notifyAllUsers,
  notifyUsersByPan
};
