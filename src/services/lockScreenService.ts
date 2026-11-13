import * as Notifications from 'expo-notifications';
import { WordItem, CardDisplayOptions } from '../types/words';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: false,
    },
  });
  return requested.granted;
}

export async function updateLockScreenWordNotification(
  word: WordItem,
  options: CardDisplayOptions
): Promise<void> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    // Dismiss previous word notification so lock screen stays clean
    await Notifications.dismissAllNotificationsAsync();

    const langTag = word.language === 'en' ? 'EN' : 'DE';
    const titleParts = [`${langTag} · ${word.word}`];
    if (options.showPronunciation && word.pronunciation) {
      titleParts.push(word.pronunciation);
    }

    const bodyParts: string[] = [];
    if (options.showMeaningTr && word.meaningTr) {
      bodyParts.push(word.meaningTr);
    }
    if (options.showExample && word.exampleSentence) {
      bodyParts.push(`"${word.exampleSentence}"`);
      if (options.showExampleTr && word.exampleSentenceTr) {
        bodyParts.push(`(${word.exampleSentenceTr})`);
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: titleParts.join('  '),
        subtitle: `Learnwords · ${word.level}`,
        body: bodyParts.length > 0 ? bodyParts.join('\n') : word.meaningTr,
        sound: undefined,
        data: { wordId: word.id },
      },
      trigger: null, // Send immediately to lock screen
    });
  } catch (error) {
    console.warn('Failed to post lockscreen notification:', error);
  }
}
