import { Alert, Platform } from 'react-native';

/** Messages and yes/no questions that work on the phone and in the browser preview. */
const web = globalThis as unknown as { alert?: (m: string) => void; confirm?: (m: string) => boolean };

export function notify(title: string, message: string): Promise<void> {
  if (Platform.OS === 'web') {
    web.alert?.(`${title}\n\n${message}`);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [{ text: 'OK', onPress: () => resolve() }], { onDismiss: () => resolve() });
  });
}

export function confirmAction(title: string, message: string, confirmLabel: string, cancelLabel: string, destructive = false): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(web.confirm ? web.confirm(`${title}\n\n${message}`) : false);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
