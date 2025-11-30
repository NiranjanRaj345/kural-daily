import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.warn("Failed to set notification handler:", error);
}

export async function registerForPushNotificationsAsync() {
  let token;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-kural', {
        name: 'Daily Kural',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return null;
    }

    return true;
  } catch (error) {
    console.warn("Failed to register for push notifications:", error);
    return false;
  }
}

export async function scheduleDailyNotification() {
  // Cancel existing to avoid duplicates
  await cancelAllNotifications();

  // Schedule for 9:00 AM
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Thirukkural Daily",
        body: "Your daily wisdom awaits! Read today's Kural.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });
  } catch (error) {
    console.warn("Failed to schedule daily notification:", error);
  }
}

export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn("Failed to cancel notifications:", error);
  }
}