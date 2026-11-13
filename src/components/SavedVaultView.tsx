import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONTS } from '../theme/colors';
import { WordItem } from '../types/words';

interface SavedVaultViewProps {
  savedWords: WordItem[];
  onRemoveWord: (word: WordItem) => void;
  onSelectWord: (word: WordItem) => void;
}

export const SavedVaultView: React.FC<SavedVaultViewProps> = ({
  savedWords,
  onRemoveWord,
  onSelectWord,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>01. Kaydedilen Kelimelerim</Text>
        <Text style={styles.sectionMeta}>{savedWords.length} kelime</Text>
      </View>

      <View style={styles.container}>
        {savedWords.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>Henüz kaydedilen kelime yok</Text>
            <Text style={styles.emptySub}>
              Öğren kartının sağ üstündeki "Kaydet" butonuna basarak beğendiğiniz
              kelimeleri bu kütüphanede toplayabilirsiniz.
            </Text>
          </View>
        ) : (
          savedWords.map((item, idx) => (
            <View
              key={item.id}
              style={[styles.itemRow, idx > 0 && styles.hairlineTop]}
            >
              <TouchableOpacity
                style={styles.itemInfo}
                onPress={() => onSelectWord(item)}
                activeOpacity={0.75}
              >
                <View style={styles.itemTop}>
                  <Text style={styles.itemWord}>{item.word}</Text>
                  <Text style={styles.itemLangBadge}>
                    {item.language === 'en' ? 'EN' : 'DE'} · {item.level}
                  </Text>
                </View>
                <Text style={styles.itemMeaning}>{item.meaningTr}</Text>
                {item.exampleSentence ? (
                  <Text style={styles.itemExample}>“{item.exampleSentence}”</Text>
                ) : null}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onRemoveWord(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.deleteBtn}
              >
                <Text style={styles.deleteText}>Sil</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 24,
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
  emptyBlock: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONTS.display,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  hairlineTop: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  itemWord: {
    fontFamily: FONTS.displayBold,
    fontSize: 17,
    color: COLORS.ink,
  },
  itemLangBadge: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkMuted,
    fontVariant: ['tabular-nums'],
  },
  itemMeaning: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.inkSecondary,
    marginBottom: 4,
  },
  itemExample: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkMuted,
    fontStyle: 'italic',
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: COLORS.danger,
  },
});
