import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTokens } from '../../theme/tokens';
import { Placeholder } from '../../ui/components';

export default function SettingsScreen() {
  const t = useTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Placeholder title="Settings" note="Soon you can save a copy of your information, bring it back, and change how the app looks." />
      </ScrollView>
    </SafeAreaView>
  );
}
