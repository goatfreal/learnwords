import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';
import { AppSettings, CardDisplayOptions, Language, UpdateFrequency, WordLevel } from '../types/words';

interface OptionsPanelProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearSeenHistory: () => void;
  seenCount: number;
}

const LANGUAGES: { key: Language; label: string }[] = [
  { key: 'all', label: 'Tümü (EN + DE)' },
  { key: 'en', label: 'İngilizce' },
  { key: 'de', label: 'Almanca' },
];

const LEVELS: WordLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

const FREQUENCIES: { key: UpdateFrequency; label: string }[] = [
  { key: 'unlock', label: 'Her Kilit Açılışında' },
  { key: '15m', label: '15 Dakika' },
  { key: '30m', label: '30 Dakika' },
  { key: '1h', label: '1 Saat' },
  { key: 'daily', label: 'Günde 1 Kelime' },
];

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
  settings,
  onUpdateSettings,
  onClearSeenHistory,
  seenCount,
}) => {
  const toggleOption = (key: keyof CardDisplayOptions) => {
    onUpdateSettings({
      ...settings,
      displayOptions: {
        ...settings.displayOptions,
        [key]: !settings.displayOptions[key],
      },
    });
  };

  const toggleLevel = (lvl: WordLevel) => {
    const existing = settings.selectedLevels;
    let next: WordLevel[] = [];
    if (existing.includes(lvl)) {
      if (existing.length === 1) return; // Keep at least one
      next = existing.filter((l) => l !== lvl);
    } else {
      next = [...existing, lvl];
    }
    onUpdateSettings({ ...settings, selectedLevels: next });
  };

  return (
    <View style={styles.section}>
      {/* Editorial Section Numbering */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>02. Kart Görünüm ve İçerik Seçenekleri</Text>
        <Text style={styles.sectionMeta}>Kişiselleştirilebilir</Text>
      </View>

      {/* Single-Elevation Surface with Hairline Dividers */}
      <View style={styles.container}>
        {/* Dil Seçimi Segmenti */}
        <View style={styles.rowBlock}>
          <Text style={styles.blockTitle}>Öğrenilen Dil</Text>
          <View style={styles.segmentBar}>
            {LANGUAGES.map((l) => {
              const active = settings.language === l.key;
              return (
                <TouchableOpacity
                  key={l.key}
                  onPress={() => onUpdateSettings({ ...settings, language: l.key })}
                  activeOpacity={0.75}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      active && styles.segmentBtnTextActive,
                    ]}
                  >
                    {l.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Seviye Filtresi */}
        <View style={[styles.rowBlock, styles.hairlineTop]}>
          <Text style={styles.blockTitle}>CEFR Seviyeleri</Text>
          <View style={styles.levelsRow}>
            {LEVELS.map((lvl) => {
              const active = settings.selectedLevels.includes(lvl);
              return (
                <TouchableOpacity
                  key={lvl}
                  onPress={() => toggleLevel(lvl)}
                  activeOpacity={0.75}
                  style={[styles.levelBtn, active && styles.levelBtnActive]}
                >
                  <Text
                    style={[
                      styles.levelBtnText,
                      active && styles.levelBtnTextActive,
                    ]}
                  >
                    {lvl}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Seçenek 1: Okunuş / Telaffuz */}
        <View style={[styles.switchRow, styles.hairlineTop]}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Okunuş / Telaffuz (IPA)</Text>
            <Text style={styles.switchSub}>
              Kelimenin fonetik okunuşunu kartta göster
            </Text>
          </View>
          <Switch
            value={settings.displayOptions.showPronunciation}
            onValueChange={() => toggleOption('showPronunciation')}
            trackColor={{ false: COLORS.borderStrong, true: COLORS.accent }}
            thumbColor={COLORS.surface}
          />
        </View>

        {/* Seçenek 2: Türkçe Anlamı */}
        <View style={[styles.switchRow, styles.hairlineTop]}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Türkçe Karşılığı</Text>
            <Text style={styles.switchSub}>
              Kelimenin detaylı Türkçe anlamını açık tut
            </Text>
          </View>
          <Switch
            value={settings.displayOptions.showMeaningTr}
            onValueChange={() => toggleOption('showMeaningTr')}
            trackColor={{ false: COLORS.borderStrong, true: COLORS.accent }}
            thumbColor={COLORS.surface}
          />
        </View>

        {/* Seçenek 3: Örnek Cümle */}
        <View style={[styles.switchRow, styles.hairlineTop]}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Örnek Cümle</Text>
            <Text style={styles.switchSub}>
              Kelimenin bağlam içinde geçtiği doğal cümleyi göster
            </Text>
          </View>
          <Switch
            value={settings.displayOptions.showExample}
            onValueChange={() => toggleOption('showExample')}
            trackColor={{ false: COLORS.borderStrong, true: COLORS.accent }}
            thumbColor={COLORS.surface}
          />
        </View>

        {/* Seçenek 4: Örnek Cümle Tercümesi */}
        {settings.displayOptions.showExample && (
          <View style={[styles.switchRow, styles.hairlineTop]}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Örnek Cümle Türkçe Çevirisi</Text>
              <Text style={styles.switchSub}>
                Örnek cümlenin Türkçe tercümesini göster
              </Text>
            </View>
            <Switch
              value={settings.displayOptions.showExampleTr}
              onValueChange={() => toggleOption('showExampleTr')}
              trackColor={{ false: COLORS.borderStrong, true: COLORS.accent }}
              thumbColor={COLORS.surface}
            />
          </View>
        )}

        {/* Kilit Ekranı Canlı Etkinlik / Bildirim Geçişi */}
        <View style={[styles.switchRow, styles.hairlineTop]}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Kilit Ekranı Canlı Bildirimi</Text>
            <Text style={styles.switchSub}>
              Telefon her uyandığında kilit ekranında kelimeyi göster
            </Text>
          </View>
          <Switch
            value={settings.lockScreenNotificationsEnabled}
            onValueChange={(val) =>
              onUpdateSettings({
                ...settings,
                lockScreenNotificationsEnabled: val,
              })
            }
            trackColor={{ false: COLORS.borderStrong, true: COLORS.accent }}
            thumbColor={COLORS.surface}
          />
        </View>

        {/* Yenilenme Sıklığı */}
        <View style={[styles.rowBlock, styles.hairlineTop]}>
          <Text style={styles.blockTitle}>Yenilenme / Değişim Periyodu</Text>
          <View style={styles.freqList}>
            {FREQUENCIES.map((f) => {
              const active = settings.frequency === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => onUpdateSettings({ ...settings, frequency: f.key })}
                  activeOpacity={0.75}
                  style={[styles.freqItem, active && styles.freqItemActive]}
                >
                  <Text
                    style={[
                      styles.freqText,
                      active && styles.freqTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                  {active && <Text style={styles.freqTick}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Havuz Sıfırlama */}
        <View style={[styles.rowBlock, styles.hairlineTop]}>
          <View style={styles.resetRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.blockTitle}>Tekrarsız Havuz Hafızası</Text>
              <Text style={styles.resetMeta}>
                Şu ana kadar {seenCount} kelime görüldü ve listeden elendi.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClearSeenHistory}
              activeOpacity={0.75}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>Havuzu Sıfırla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 15,
    color: COLORS.ink,
    letterSpacing: -0.2,
  },
  sectionMeta: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkMuted,
    fontVariant: ['tabular-nums'],
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  rowBlock: {
    padding: 16,
  },
  hairlineTop: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  blockTitle: {
    fontFamily: FONTS.display,
    fontSize: 13,
    color: COLORS.ink,
    marginBottom: 8,
  },
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMuted,
    padding: 4,
    borderRadius: 8,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surface,
  },
  segmentBtnText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  segmentBtnTextActive: {
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.ink,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  levelBtnActive: {
    backgroundColor: COLORS.ink,
    borderColor: COLORS.ink,
  },
  levelBtnText: {
    fontFamily: FONTS.monoMedium,
    fontSize: 12,
    color: COLORS.inkSecondary,
    fontVariant: ['tabular-nums'],
  },
  levelBtnTextActive: {
    color: COLORS.surface,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switchInfo: {
    flex: 1,
    marginRight: 12,
  },
  switchLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.ink,
  },
  switchSub: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  freqList: {
    gap: 6,
  },
  freqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceMuted,
  },
  freqItemActive: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  freqText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.inkSecondary,
  },
  freqTextActive: {
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.ink,
  },
  freqTick: {
    fontFamily: FONTS.monoMedium,
    fontSize: 12,
    color: COLORS.accent,
  },
  resetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetMeta: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.inkMuted,
    lineHeight: 16,
  },
  resetBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.background,
  },
  resetBtnText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11,
    color: COLORS.danger,
  },
});
