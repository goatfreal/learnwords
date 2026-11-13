import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../theme/colors';
import { WordItem, WordLevel } from '../types/words';
import { generateNewWordsWithNvidia } from '../services/wordAiService';

interface AiGeneratorViewProps {
  apiKey: string;
  onAddGeneratedWords: (words: WordItem[]) => void;
  existingWords: string[];
}

export const AiGeneratorView: React.FC<AiGeneratorViewProps> = ({
  apiKey,
  onAddGeneratedWords,
  existingWords,
}) => {
  const [selectedLang, setSelectedLang] = useState<'en' | 'de'>('en');
  const [selectedLevel, setSelectedLevel] = useState<WordLevel>('B2');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultBatch, setResultBatch] = useState<WordItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const generated = await generateNewWordsWithNvidia(
        selectedLang,
        selectedLevel,
        existingWords,
        apiKey
      );
      setResultBatch(generated);
      onAddGeneratedWords(generated);
      setStatusMessage(
        `NVIDIA AI motoru ile ${generated.length} yeni kelime üretildi ve havuza eklendi!`
      );
    } catch (err: any) {
      setStatusMessage(err?.message || 'Üretim sırasında hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>01. NVIDIA AI Kelime Fabrikası</Text>
        <Text style={styles.sectionMeta}>Nemotron 3.5 Lightning</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Hedef Dil</Text>
          <View style={styles.segmentBar}>
            {[
              { id: 'en', label: 'İngilizce' },
              { id: 'de', label: 'Almanca' },
            ].map((l) => {
              const active = selectedLang === l.id;
              return (
                <TouchableOpacity
                  key={l.id}
                  onPress={() => setSelectedLang(l.id as 'en' | 'de')}
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

        <View style={[styles.block, styles.hairlineTop]}>
          <Text style={styles.blockTitle}>Hedef Seviye</Text>
          <View style={styles.levelsRow}>
            {(['A1', 'A2', 'B1', 'B2', 'C1'] as WordLevel[]).map((lvl) => {
              const active = selectedLevel === lvl;
              return (
                <TouchableOpacity
                  key={lvl}
                  onPress={() => setSelectedLevel(lvl)}
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

        <View style={[styles.block, styles.hairlineTop]}>
          <TouchableOpacity
            style={[styles.generateBtn, isGenerating && { opacity: 0.5 }]}
            onPress={handleGenerate}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={COLORS.surface} />
            ) : (
              <Text style={styles.generateBtnText}>3 Yeni Kelime Üret ve Havuza Ekle</Text>
            )}
          </TouchableOpacity>

          {statusMessage && (
            <Text style={styles.statusText}>{statusMessage}</Text>
          )}
        </View>

        {resultBatch.length > 0 && (
          <View style={styles.resultsBlock}>
            <Text style={styles.resultsHeading}>Son Eklenenler</Text>
            {resultBatch.map((w, idx) => (
              <View
                key={w.id}
                style={[styles.resultItem, idx > 0 && styles.hairlineTop]}
              >
                <View style={styles.resultItemTop}>
                  <Text style={styles.resultWord}>{w.word}</Text>
                  <Text style={styles.resultMeta}>
                    {w.pronunciation} · {w.level}
                  </Text>
                </View>
                <Text style={styles.resultMeaning}>{w.meaningTr}</Text>
                <Text style={styles.resultExample}>“{w.exampleSentence}”</Text>
              </View>
            ))}
          </View>
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
  block: {
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
  generateBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 13,
    borderRadius: 6,
    alignItems: 'center',
  },
  generateBtnText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    color: COLORS.surface,
  },
  statusText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkSecondary,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 16,
  },
  resultsBlock: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resultsHeading: {
    fontFamily: FONTS.monoMedium,
    fontSize: 11,
    color: COLORS.inkMuted,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    textTransform: 'uppercase',
  },
  resultItem: {
    padding: 16,
  },
  resultItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  resultWord: {
    fontFamily: FONTS.displayBold,
    fontSize: 16,
    color: COLORS.ink,
  },
  resultMeta: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.inkMuted,
  },
  resultMeaning: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.inkSecondary,
    marginBottom: 2,
  },
  resultExample: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.inkMuted,
    fontStyle: 'italic',
  },
});
