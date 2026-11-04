import { router } from 'expo-router';
import { useLanguage } from '../state/language';
import { IconButton } from './kit';

/** The gear in the corner of every main screen: opens Settings. */
export function GearButton() {
  const { S } = useLanguage();
  return <IconButton icon="settings-outline" label={S.a11y.settingsButton} onPress={() => router.push('/settings')} />;
}
