import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTokens } from '../../theme/tokens';
import { Placeholder } from '../../ui/components';

export default function HistoryScreen() {
  const t = useTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Placeholder title="My cycles" note="Soon you will see every cycle here, how long each one was, and what is usual for you. You can show this to your doctor." />
      </ScrollView>
    </SafeAreaView>
  );
}
