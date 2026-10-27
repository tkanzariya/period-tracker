import { router } from 'expo-router';

/** Close a screen; if there is nothing to go back to (opened directly), land on Today. */
export function goBackOrHome(): void {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
