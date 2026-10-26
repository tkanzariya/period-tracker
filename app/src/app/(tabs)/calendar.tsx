import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, useTokens } from '../../theme/tokens';
import { Placeholder } from '../../ui/components';

export default function CalendarScreen() {
  const t = useTokens();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Placeholder title="Calendar" note="Soon you will see all your days here: your period, ovulation, and when the next period may come." />
      </ScrollView>
    </SafeAreaView>
  );
}
