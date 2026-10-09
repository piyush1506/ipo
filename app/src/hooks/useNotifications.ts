import { useEffect, useState } from 'react';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { useAuth } from './useAuth';
import { updatePushToken } from '../api/userApi';

// Android push notifications via expo-notifications were removed from Expo Go in SDK 53.
// Simply importing 'expo-notifications' at the top-level triggers an uncatchable fatal error in Expo Go on Android.
let Notifications: any = null;
const isExpoGo = (typeof isRunningInExpoGo === 'function' ? isRunningInExpoGo() : false) || Constants.appOwnership === 'expo';

if (!isExpoGo || Platform.OS !== 'android') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler?.({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    console.warn('Could not initialize notifications:', e);
  }
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const { user } = useAuth();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (token && user) {
        // Sync token to backend
        updatePushToken(user._id, token).catch(err => {
          console.warn('Failed to sync push token:', err);
        });
      }
    });
  }, [user]);

  return { expoPushToken };
}

async function registerForPushNotificationsAsync() {
  if (isExpoGo || !Notifications) {
    console.log('[useNotifications] Push notifications are disabled in Expo Go. Use a development build for push testing.');
    return undefined;
  }

  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return undefined;
    }

    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: 'dummy-project-id',
          })
        )?.data;
      } else {
        token = (await Notifications.getExpoPushTokenAsync({ projectId }))?.data;
      }
    } catch (e) {
      console.warn('Could not get push token', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

