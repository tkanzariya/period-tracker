/** The browser preview has no reminders; every call does nothing. */
export type Permission = 'granted' | 'denied' | 'undetermined';

export interface Scheduled {
  title: string;
  body: string;
  at: Date;
  kind: string;
}

export async function getPermission(): Promise<Permission> {
  return 'undetermined';
}
export async function requestPermission(_channelName: string): Promise<Permission> {
  return 'granted';
}
export async function scheduleAll(_channelName: string, _items: Scheduled[]): Promise<void> {}
export async function cancelAll(): Promise<void> {}
export function listenForTaps(_handler: (kind: string) => void): () => void {
  return () => {};
}
