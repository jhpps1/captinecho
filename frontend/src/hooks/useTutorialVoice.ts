import { useState, useEffect, useRef, useCallback } from 'react';

export function useTutorialVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentVoiceType, setCurrentVoiceType] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // speechSynthesis 초기화
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // 음성 재생
  const playVoice = useCallback((type: string, text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    setTimeout(() => {
      if (!synthRef.current) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.95;

      utterance.onend = () => {
        setIsSpeaking(false);
        setCurrentVoiceType(null);
      };

      setIsSpeaking(true);
      setCurrentVoiceType(type);
      synthRef.current.speak(utterance);
    }, 100);
  }, []);

  // 음성 중지
  const stopVoice = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setCurrentVoiceType(null);
    }
  }, []);

  // 언마운트 시 음성 정리
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  return {
    isSpeaking,
    currentVoiceType,
    playVoice,
    stopVoice,
  };
}
