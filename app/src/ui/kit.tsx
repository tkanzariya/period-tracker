/**
 * Cycle Saathi's building blocks (docs/context/ux-standards.md sections 4, 5, 7).
 * Calm, roomy and rounded: soft cards, one filled button per screen, an icon with every label,
 * our OWN popups and toasts (never Android's system dialogs), every tap target at least 48dp,
 * text that follows the phone's font size, colours only from the theme tokens.
 */
import { Ionicons } from '@expo/vector-icons';
import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from 'react';
import {
  Animated, KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  type NativeScrollEvent, type NativeSyntheticEvent, type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Phase } from '../domain/types';
import { useLanguage } from '../state/language';
import { MIN_TARGET, radius, spacing, typeScale, type PhaseColors } from '../theme/tokens';
import { useTokens } from '../theme/useTokens';

export type IconName = keyof typeof Ionicons.glyphMap;

// ---------- text ------------------------------------------------------------------------------
type TextKind = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';
const TEXT: Record<TextKind, TextStyle> = {
  display: typeScale.display,
  title: typeScale.largeTitle,
  heading: typeScale.title,
  body: typeScale.body,
  label: typeScale.headline,
  caption: typeScale.footnote,
};

export function T({ kind = 'body', muted, color, center, children, style, numberOfLines }: {
  kind?: TextKind; muted?: boolean; color?: string; center?: boolean; children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number;
}) {
  const t = useTokens();
  return (
    <Text
      numberOfLines={numberOfLines}
      accessibilityRole={kind === 'title' || kind === 'heading' ? 'header' : undefined}
      style={[TEXT[kind], { color: color ?? (muted ? t.text2 : t.text), textAlign: center ? 'center' : undefined }, style]}
    >
      {children}
    </Text>
  );
}

// ---------- screen and header ---------------------------------------------------------------
/**
 * A page: optional header (title, back arrow, actions on the right), a scrolling body and an optional
 * footer that stays above the keyboard (Android's edge-to-edge no longer resizes the window).
 */
export function Screen({ title, subtitle, back, onBack, actions, children, footer, onScroll, bottomSpace = 24 }: {
  title?: string; subtitle?: string; back?: boolean; onBack?: () => void; actions?: ReactNode; children: ReactNode; footer?: ReactNode;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void; bottomSpace?: number;
}) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { S } = useLanguage();
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: t.background, paddingTop: insets.top }}>
      {title !== undefined || back ? (
        <View style={styles.header}>
          {back ? <IconButton icon="arrow-back" label={S.a11y.goBack} onPress={onBack ?? (() => undefined)} /> : null}
          <View style={{ flex: 1 }}>
            {subtitle ? <T kind="caption" muted numberOfLines={1}>{subtitle}</T> : null}
            <Text accessibilityRole="header" numberOfLines={1} style={[TEXT.title, { color: t.text, fontSize: back ? 24 : 30, lineHeight: back ? 30 : 36 }]}>{title}</Text>
          </View>
          {actions}
        </View>
      ) : null}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }} onScroll={onScroll} scrollEventThrottle={16}>
        <View style={[styles.body, { paddingBottom: footer ? spacing.lg : insets.bottom + bottomSpace }]}>{children}</View>
      </ScrollView>
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: t.background }]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

export function IconButton({ icon, label, onPress, color, size = 24 }: { icon: IconName; label: string; onPress: () => void; color?: string; size?: number }) {
  const t = useTokens();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, { backgroundColor: pressed ? t.surface2 : 'transparent' }]}
    >
      <Ionicons name={icon} size={size} color={color ?? t.text} />
    </Pressable>
  );
}

// ---------- surfaces ------------------------------------------------------------------------
export function Card({ children, style, tone = 'plain' }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: 'plain' | 'primary' | 'attention' }) {
  const t = useTokens();
  const bg = tone === 'primary' ? t.primarySoft : tone === 'attention' ? t.attentionSoft : t.surface;
  return <View style={[styles.card, { backgroundColor: bg, borderColor: t.line }, style]}>{children}</View>;
}

/** An inline message in the amber "please look" tone, with the next step (never red, never a popup). */
export function Notice({ title, body, actions, icon = 'information-circle' }: { title: string; body?: string; actions?: ReactNode; icon?: IconName }) {
  const t = useTokens();
  return (
    <View accessibilityLiveRegion="polite" style={[styles.notice, { backgroundColor: t.attentionSoft, borderColor: t.attention }]}>
      <Ionicons name={icon} size={22} color={t.attention} style={{ marginTop: 1 }} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[TEXT.label, { color: t.text }]}>{title}</Text>
        {body ? <Text style={[TEXT.caption, { color: t.text }]}>{body}</Text> : null}
        {actions ? <View style={{ marginTop: 6, gap: 6 }}>{actions}</View> : null}
      </View>
    </View>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.section}>
      <T kind="caption" muted style={{ fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</T>
    </View>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  const t = useTokens();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.line, marginLeft: inset }} />;
}

export function IconCircle({ icon, size = 42, tint }: { icon: IconName; size?: number; tint?: PhaseColors }) {
  const t = useTokens();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tint?.bg ?? t.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={Math.round(size * 0.5)} color={tint?.fg ?? t.primary} />
    </View>
  );
}

/** A quiet note at the bottom of a screen (for example "guesses only"): an icon and a line, in a soft box. */
export function Disclaimer({ text }: { text: string }) {
  const t = useTokens();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center', backgroundColor: t.surface2, borderRadius: 16, padding: spacing.md }}>
      <Ionicons name="shield-checkmark-outline" size={22} color={t.text2} />
      <T kind="caption" muted style={{ flex: 1 }}>{text}</T>
    </View>
  );
}

// ---------- rows ----------------------------------------------------------------------------
export function ListRow({ icon, title, subtitle, value, onPress, chevron, accessibilityLabel, right }: {
  icon?: IconName; title: string; subtitle?: string; value?: string; onPress?: () => void; chevron?: boolean; accessibilityLabel?: string; right?: ReactNode;
}) {
  const t = useTokens();
  const inner = (
    <View style={styles.row}>
      {icon ? <IconCircle icon={icon} /> : null}
      <View style={{ flex: 1, minWidth: 120 }}>
        <T kind="label" numberOfLines={2}>{title}</T>
        {subtitle ? <T kind="caption" muted numberOfLines={2}>{subtitle}</T> : null}
      </View>
      {value ? <T kind="caption" muted numberOfLines={1} style={{ maxWidth: 130 }}>{value}</T> : null}
      {right}
      {chevron ? <Ionicons name="chevron-forward" size={20} color={t.text2} /> : null}
    </View>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => ({ backgroundColor: pressed ? t.surface2 : 'transparent', borderRadius: 14 })}
    >
      {inner}
    </Pressable>
  ) : inner;
}

// ---------- buttons -------------------------------------------------------------------------
export function Button({ label, onPress, variant = 'primary', icon, disabled, style, small }: {
  label: string; onPress: () => void; variant?: 'primary' | 'tonal' | 'text' | 'danger'; icon?: IconName; disabled?: boolean; style?: StyleProp<ViewStyle>; small?: boolean;
}) {
  const t = useTokens();
  const bg = variant === 'primary' ? t.primary : variant === 'tonal' ? t.primarySoft : variant === 'danger' ? t.danger : 'transparent';
  const fg = variant === 'primary' ? t.onPrimary : variant === 'danger' ? t.onDanger : t.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, small && styles.buttonSmall, { backgroundColor: bg, opacity: disabled ? 0.45 : pressed ? 0.82 : 1 }, style]}
    >
      {icon ? <Ionicons name={icon} size={small ? 18 : 20} color={fg} /> : null}
      <Text style={[styles.buttonText, small && { fontSize: 15 }, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/** Slides the floating button away while the page scrolls down, back when scrolling up. */
export function useHideOnScroll() {
  const [visible, setVisible] = useState(true);
  const last = useRef(0);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const dy = y - last.current;
    last.current = y;
    if (y < 40 || dy < -6) setVisible(true);
    else if (dy > 6) setVisible(false);
  }, []);
  return { visible, onScroll };
}

/** The extended floating button (Android pattern). Its words change with the situation. */
export function Fab({ label, icon, onPress, visible = true, hint }: { label: string; icon: IconName; onPress: () => void; visible?: boolean; hint?: string }) {
  const t = useTokens();
  const shown = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(shown, { toValue: visible ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [visible, shown]);
  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[styles.fab, { bottom: spacing.lg, opacity: shown, transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [90, 0] }) }] }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={hint}
        onPress={onPress}
        style={({ pressed }) => [styles.fabInner, { backgroundColor: t.primary, opacity: pressed ? 0.88 : 1 }]}
      >
        <Ionicons name={icon} size={24} color={t.onPrimary} />
        <Text style={[styles.buttonText, { color: t.onPrimary, fontSize: 17 }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ---------- choices -------------------------------------------------------------------------
export function Chip({ label, selected, onPress, icon, style }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? t.primary : t.surface, borderColor: selected ? t.primary : t.line }, style]}
    >
      {selected ? <Ionicons name="checkmark" size={16} color={t.onPrimary} /> : icon ? <Ionicons name={icon} size={16} color={t.text2} /> : null}
      <Text style={{ color: selected ? t.onPrimary : t.text, fontSize: 15, fontWeight: selected ? '700' : '500' }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<V extends string>({ options, value, onChange }: { options: { value: V; label: string; icon?: IconName }[]; value: V; onChange: (v: V) => void }) {
  const t = useTokens();
  return (
    <View accessibilityRole="tablist" style={[styles.segment, { backgroundColor: t.surface2 }]}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, on && { backgroundColor: t.surface, elevation: 1 }]}
          >
            {o.icon ? <Ionicons name={o.icon} size={16} color={on ? t.primary : t.text2} /> : null}
            <Text numberOfLines={2} style={{ color: on ? t.text : t.text2, fontWeight: on ? '700' : '500', fontSize: 14, textAlign: 'center', flexShrink: 1 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- form fields ---------------------------------------------------------------------
/** A labelled field with an example underneath, so nobody has to guess what to type. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <T kind="label">{label}</T>
      {children}
      {hint ? <T kind="caption" muted>{hint}</T> : null}
    </View>
  );
}

export function Input({ value, onChange, placeholder, label, multiline, maxLength, autoFocus, autoCapitalize }: {
  value: string; onChange: (v: string) => void; placeholder?: string; label: string; multiline?: boolean; maxLength?: number; autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words';
}) {
  const t = useTokens();
  return (
    <View style={{ minWidth: 0 }}>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.text2}
        multiline={multiline}
        maxLength={maxLength}
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        style={[styles.input, { backgroundColor: t.surface2, color: t.text, width: '100%' }, multiline && { minHeight: 96, textAlignVertical: 'top', paddingTop: 14 }]}
      />
    </View>
  );
}

// ---------- bottom sheet ----------------------------------------------------------------------
export function Sheet({ visible, onClose, title, children, footer }: { visible: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode }) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { S } = useLanguage();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable accessibilityLabel={S.a11y.closeSheet} onPress={onClose} style={StyleSheet.absoluteFill}>
          <View style={{ flex: 1, backgroundColor: t.scrim }} />
        </Pressable>
        <View style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: insets.bottom + spacing.lg, maxHeight: '92%' }]}>
          <View style={[styles.grab, { backgroundColor: t.control }]} />
          {title ? <T kind="heading" style={{ marginBottom: spacing.sm }}>{title}</T> : null}
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.sm }}>{children}</ScrollView>
          {footer ? <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------- popups (our own; never Android's system dialogs) -----------------------------------------
type PopupAction<V> = { label: string; value: V; kind?: 'primary' | 'tonal' | 'text' | 'danger'; icon?: IconName };
type PopupRequest = { title: string; message?: string; icon?: IconName; actions: PopupAction<unknown>[]; resolve: (v: unknown) => void };
type AskArgs<V> = { title: string; message?: string; icon?: IconName; actions: PopupAction<V>[] };
const PopupContext = createContext<{ ask: <V>(r: AskArgs<V>) => Promise<V | null> } | null>(null);

export function PopupProvider({ children }: { children: ReactNode }) {
  const t = useTokens();
  const [request, setRequest] = useState<PopupRequest | null>(null);
  const ask = useCallback(
    <V,>(r: AskArgs<V>) =>
      new Promise<V | null>((resolve) => setRequest({ ...r, actions: r.actions as PopupAction<unknown>[], resolve: resolve as (v: unknown) => void })),
    [],
  );
  const close = (value: unknown) => {
    const r = request;
    setRequest(null);
    r?.resolve(value);
  };
  return (
    <PopupContext.Provider value={{ ask }}>
      {children}
      <Modal visible={!!request} transparent animationType="fade" onRequestClose={() => close(null)} statusBarTranslucent>
        <View style={[styles.popupBackdrop, { backgroundColor: t.scrim }]}>
          <View accessibilityViewIsModal style={[styles.popup, { backgroundColor: t.surface }]}>
            {request?.icon ? (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name={request.icon} size={40} color={request.actions.some((a) => a.kind === 'danger') ? t.danger : t.primary} />
              </View>
            ) : null}
            <T kind="heading" center>{request?.title ?? ''}</T>
            {request?.message ? <T muted center>{request.message}</T> : null}
            <View style={{ gap: spacing.sm, marginTop: 6 }}>
              {request?.actions.map((a, i) => (
                <Button key={i} label={a.label} icon={a.icon} variant={a.kind ?? (i === 0 ? 'primary' : 'text')} onPress={() => close(a.value)} />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const ctx = useContext(PopupContext);
  const { S } = useLanguage();
  if (!ctx) throw new Error('usePopup needs PopupProvider');
  return {
    ask: ctx.ask,
    /** A yes/no question. The yes button says what will happen. */
    confirm: async (o: { title: string; message?: string; yes: string; no?: string; danger?: boolean; icon?: IconName }) =>
      (await ctx.ask({
        title: o.title,
        message: o.message,
        icon: o.icon,
        actions: [
          { label: o.yes, value: true, kind: o.danger ? 'danger' : 'primary', icon: o.danger ? 'trash' : undefined },
          { label: o.no ?? S.common.cancel, value: false, kind: 'text' },
        ],
      })) === true,
    /** Information she must see: one clear button. */
    info: async (o: { title: string; message?: string; icon?: IconName; button?: string }) => {
      await ctx.ask({ title: o.title, message: o.message, icon: o.icon, actions: [{ label: o.button ?? S.common.gotIt, value: true }] });
    },
  };
}

// ---------- toast with Undo (top right, under the header) -------------------------------------------
type ToastData = { message: string; actionLabel?: string; onAction?: () => void };
const ToastContext = createContext<{ show: (d: ToastData) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((d: ToastData) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(d);
    timer.current = setTimeout(() => setToast(null), d.actionLabel ? 6000 : 3500);
  }, []);
  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: insets.top + 72, paddingHorizontal: spacing.lg, zIndex: 100, elevation: 20 }]}>
          <View accessibilityLiveRegion="polite" style={[styles.toast, { backgroundColor: t.text, maxWidth: 340 }]}>
            <Text style={{ color: t.background, fontSize: 15, flex: 1 }}>{toast.message}</Text>
            {toast.actionLabel ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setToast(null);
                  toast.onAction?.();
                }}
                hitSlop={10}
                style={{ minHeight: MIN_TARGET - 4, justifyContent: 'center', paddingHorizontal: 6 }}
              >
                <Text style={{ color: t.primarySoft, fontWeight: '800', fontSize: 15 }}>{toast.actionLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast needs ToastProvider');
  return ctx;
}

// ---------- phase chip ------------------------------------------------------------------------
export const PHASE_ICON: Record<Phase, IconName> = {
  menstrual: 'water',
  follicular: 'contrast-outline',
  ovulation: 'sparkles',
  luteal: 'moon',
};

/** Phase icon + word, always paired with colour so colour is never the only signal. */
export function PhaseChip({ phase }: { phase: Phase }) {
  const t = useTokens();
  const { S } = useLanguage();
  const c = t.phase[phase];
  return (
    <View style={[styles.phaseChip, { backgroundColor: c.bg }]} accessibilityLabel={S.phases.names[phase]}>
      <Ionicons name={PHASE_ICON[phase]} size={16} color={c.fg} />
      <Text style={{ color: c.fg, fontSize: 15, fontWeight: '700' }}>{S.phases.names[phase]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.lg, gap: spacing.lg, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md, minHeight: 64 },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  iconButton: { width: MIN_TARGET, height: MIN_TARGET, borderRadius: MIN_TARGET / 2, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: radius.card, padding: spacing.lg, gap: spacing.sm, borderWidth: StyleSheet.hairlineWidth },
  notice: { flexDirection: 'row', gap: spacing.md, borderRadius: 16, borderWidth: 1, padding: spacing.md },
  section: { marginTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 60, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs },
  button: { minHeight: 54, borderRadius: radius.button, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 10 },
  buttonSmall: { minHeight: MIN_TARGET, paddingHorizontal: spacing.lg, borderRadius: 24 },
  buttonText: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  fab: { position: 'absolute', right: spacing.lg, elevation: 6 },
  fabInner: { minHeight: 58, borderRadius: radius.card, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: { minHeight: MIN_TARGET - 4, borderRadius: 24, borderWidth: 1, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 6 },
  segment: { flexDirection: 'row', borderRadius: 16, padding: 4, gap: 4 },
  segmentItem: { flex: 1, minHeight: MIN_TARGET, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4, paddingHorizontal: 4 },
  input: { minHeight: 52, borderRadius: radius.field, paddingHorizontal: 14, fontSize: 17 },
  sheet: { borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, paddingHorizontal: 20, paddingTop: 10 },
  grab: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
  popupBackdrop: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  popup: { borderRadius: radius.sheet, padding: 22, gap: 10 },
  toast: { borderRadius: 16, paddingHorizontal: spacing.lg, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, elevation: 24 },
  phaseChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
});
