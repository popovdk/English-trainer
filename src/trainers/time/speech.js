// Озвучка через Web Speech API с британским голосом, если он есть в системе.

export const canSpeak = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  const british = voices.filter((v) => /en[-_]GB/i.test(v.lang));
  return (
    british.find((v) => /Daniel|Serena|Kate|Google UK/i.test(v.name)) ??
    british[0] ??
    voices.find((v) => /^en/i.test(v.lang))
  );
}

export function speak(text) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  utterance.rate = 0.9;
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

// Safari/Chrome подгружают голоса асинхронно
if (canSpeak()) speechSynthesis.getVoices();
