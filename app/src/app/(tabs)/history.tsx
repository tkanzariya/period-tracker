import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTokens } from '../../theme/tokens';
import { Placeholder } from '../../ui/components';

export default function HistoryScreen() {
  const t = useTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Placeholder title="History" note="Every cycle with its length, plus averages and the usual range." />
      </ScrollView>
    </SafeAreaView>
  );
}
