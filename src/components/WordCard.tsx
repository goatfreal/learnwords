import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';
import { CardDisplayOptions, WordItem } from '../types/words';

interface WordCardProps {
  word: WordItem;
  displayOptions: CardDisplayOptions;
  isSaved: boolean;
  onToggleSave: () => void;
  onNextWord: () => void;
  isLoadingNext?: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  displayOptions,
  isSaved,
  onToggleSave,
  onNextWord,
  isLoadingNext = false,
}) => {
  const langLabel = word.language === 'en' ? 'İngilizce' : 'Almanca';
  const langColor = word.language === 'en' ? COLORS.cobalt : COLORS.terracotta;

  return (
    <View style={styles.section}>
      {/* Editorial Section Numbering */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>01. Aktif Kelime Kartı</Text>
        <Text style={styles.sectionMeta}>
          {langLabel} · {word.level} · {word.partOfSpeech}
        </Text>
      </View>

      {/* Single-Elevation Container (No cards inside cards, 1px hairline border) */}
      <View style={styles.container}>
        {/* Top Hero Word Block */}
        <View style={styles.heroBlock}>
          <View style={styles.wordRow}>
            <Text style={styles.wordText} numberOfLines={2}>
              {word.word}
            </Text>
            <TouchableOpacity
              onPress={onToggleSave}
              activeOpacity={0.75}
              style={[
                styles.saveBadgeBtn,
                isSaved && styles.saveBadgeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.saveBadgeText,
                  isSaved && styles.saveBadgeTextActive,
                ]}
              >
                {isSaved ? 'Kaydedildi ✓' : 'Kaydet'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Okunuşu (IPA / Fonetik) - Açılıp Kapatılabilir */}
          {displayOptions.showPronunciation && word.pronunciation ? (
            <Text style={styles.pronunciationText}>{word.pronunciation}</Text>
          ) : null}
        </View>

        {/* Türkçe Anlamı - Açılıp Kapatılabilir (Hairline Divider) */}
        {displayOptions.showMeaningTr && word.meaningTr ? (
          <View style={styles.hairlineRow}>
            <Text style={styles.subMetaLabel}>Türkçe Karşılığı</Text>
            <Text style={styles.meaningText}>{word.meaningTr}</Text>
          </View>
        ) : null}

        {/* Örnek Cümle ve Tercümesi - Açılıp Kapatılabilir (Hairline Divider) */}
        {displayOptions.showExample && word.exampleSentence ? (
          <View style={styles.hairlineRow}>
            <Text style={styles.subMetaLabel}>Örnek Kullanım</Text>
            <Text style={styles.exampleSentence}>“{word.exampleSentence}”</Text>
            {displayOptions.showExampleTr && word.exampleSentenceTr ? (
              <Text style={styles.exampleSentenceTr}>
                {word.exampleSentenceTr}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Eşanlamlılar / Synonyms (Quiet metadata) */}
        {word.synonyms && word.synonyms.length > 0 ? (
          <View style={styles.hairlineRow}>
            <Text style={styles.synonymsMeta}>
              Eşanlamlılar: {word.synonyms.join(' · ')}
            </Text>
          </View>
        ) : null}

        {/* Bottom Action Row: Next Word (Tekrarsız Yeni Kelime) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.nextBtn, isLoadingNext && styles.nextBtnDisabled]}
            onPress={onNextWord}
            disabled={isLoadingNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextBtnText}>
              {isLoadingNext ? 'Yeni Kelime Getiriliyor...' : 'Yeni Kelime Getir ›'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 18,
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
  heroBlock: {
    padding: 20,
  },
  wordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  wordText: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    lineHeight: 38,
    color: COLORS.ink,
    letterSpacing: -0.8,
    flex: 1,
  },
  saveBadgeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.background,
  },
  saveBadgeBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  saveBadgeText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 11,
    color: COLORS.inkSecondary,
  },
  saveBadgeTextActive: {
    color: COLORS.surface,
  },
  pronunciationText: {
    fontFamily: FONTS.monoMedium,
    fontSize: 14,
    color: COLORS.inkMuted,
    marginTop: 6,
  },
  hairlineRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  subMetaLabel: {
    fontFamily: FONTS.monoMedium,
    fontSize: 11,
    color: COLORS.inkMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  meaningText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: COLORS.ink,
    lineHeight: 23,
  },
  exampleSentence: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.ink,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  exampleSentenceTr: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.inkSecondary,
    lineHeight: 19,
    marginTop: 4,
  },
  synonymsMeta: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkSecondary,
  },
  actionRow: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surfaceMuted,
  },
  nextBtn: {
    backgroundColor: COLORS.ink,
    paddingVertical: 13,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextBtnText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.surface,
  },
});
