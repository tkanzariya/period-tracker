import { useColorScheme } from 'react-native';
import { darkTokens, lightTokens, type Tokens } from './tokens';

/** The colours for the phone's current light or dark setting (the app follows the system). */
export function useTokens(): Tokens {
  return useColorScheme() === 'dark' ? darkTokens : lightTokens;
}
