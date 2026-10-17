const mongoose = require('mongoose');

// Schema for registered device push tokens
const PushTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'unknown'],
    default: 'android',
  },
  deviceModel: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
});

// Schema for broadcast history
const NotificationLogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    default: {},
  },
  recipientsCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

const PushToken = mongoose.models.PushToken || mongoose.model('PushToken', PushTokenSchema);
const NotificationLog = mongoose.models.NotificationLog || mongoose.model('NotificationLog', NotificationLogSchema);

module.exports = {
  PushToken,
  NotificationLog,
};
