import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Saving and picking files, the same call on the phone and in the browser preview.
 * Phone: writes a file and opens the share sheet (save to Drive, send on WhatsApp, etc.).
 * Browser: downloads the file.
 */
export type SaveResult = 'shared' | 'downloaded' | 'unavailable';

export async function saveTextFile(filename: string, content: string, mimeType: string): Promise<SaveResult> {
  if (Platform.OS === 'web') {
    const g = globalThis as unknown as {
      document: { createElement(tag: string): { href: string; download: string; click(): void } };
      URL: { createObjectURL(blob: unknown): string; revokeObjectURL(url: string): void };
      Blob: new (parts: string[], options: { type: string }) => unknown;
    };
    const url = g.URL.createObjectURL(new g.Blob([content], { type: mimeType }));
    const link = g.document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    g.URL.revokeObjectURL(url);
    return 'downloaded';
  }

  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(content);
  if (!(await Sharing.isAvailableAsync())) return 'unavailable';
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: filename });
  return 'shared';
}

/** Lets her pick a file and returns its text, or null if she cancelled. */
export async function pickTextFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  if (Platform.OS === 'web') {
    const webFile = (asset as unknown as { file?: { text(): Promise<string> } }).file;
    return webFile ? webFile.text() : null;
  }
  return new File(asset.uri).text();
}
