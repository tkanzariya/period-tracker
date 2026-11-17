import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Local reminders on the phone (no server, no account). The browser preview has none (see
 * notifications.web.ts). Everything is cancelled and planned again whenever her information changes.
 */
export type Permission = 'granted' | 'denied' | 'undetermined';

export interface Scheduled {
  title: string;
  body: string;
  at: Date;
  /** Which reminder kind this is; sent back when she taps it. */
  kind: string;
}

const CHANNEL = 'reminders';
let ready = false;

async function setup(channelName: string): Promise<void> {
  if (ready) return;
  ready = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: channelName,
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      vibrationPattern: [0, 200],
    });
  }
}

function toPermission(status: { granted: boolean; canAskAgain: boolean }): Permission {
  if (status.granted) return 'granted';
  return status.canAskAgain ? 'undetermined' : 'denied';
}

export async function getPermission(): Promise<Permission> {
  return toPermission(await Notifications.getPermissionsAsync());
}

/** Shows the phone's own permission question (needed on Android 13 and newer). */
export async function requestPermission(channelName: string): Promise<Permission> {
  await setup(channelName);
  return toPermission(await Notifications.requestPermissionsAsync());
}

/** Replaces every planned reminder with this list. */
export async function scheduleAll(channelName: string, items: Scheduled[]): Promise<void> {
  await setup(channelName);
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const item of items) {
    await Notifications.scheduleNotificationAsync({
      content: { title: item.title, body: item.body, data: { kind: item.kind } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.at, channelId: CHANNEL },
    });
  }
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Calls back with the reminder kind when she taps a reminder (also if it opened the app from closed). */
export function listenForTaps(handler: (kind: string) => void): () => void {
  const pick = (response: Notifications.NotificationResponse | null) => {
    const kind = response?.notification.request.content.data?.kind;
    if (typeof kind === 'string') handler(kind);
  };
  void Notifications.getLastNotificationResponseAsync().then(pick);
  const subscription = Notifications.addNotificationResponseReceivedListener(pick);
  return () => subscription.remove();
}
