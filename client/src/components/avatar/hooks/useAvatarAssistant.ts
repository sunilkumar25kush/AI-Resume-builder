import { useCallback } from "react";
import { useAvatarStore, type AssistantAction } from "../useAvatarStore";

export function useAvatarAssistant() {
  const mood = useAvatarStore((state) => state.mood);
  const message = useAvatarStore((state) => state.message);
  const enabled = useAvatarStore((state) => state.enabled);
  const minimized = useAvatarStore((state) => state.minimized);
  const character = useAvatarStore((state) => state.getCharacter());

  const setMood = useAvatarStore((state) => state.setMood);
  const say = useAvatarStore((state) => state.say);
  const resetToIdle = useAvatarStore((state) => state.resetToIdle);
  const setMinimized = useAvatarStore((state) => state.setMinimized);

  const celebrate = useCallback(
    (text?: string, autoRevertMs = 6000, action?: AssistantAction) => {
      setMood("celebrating", text, autoRevertMs, action);
    },
    [setMood]
  );

  const warn = useCallback(
    (text: string, autoRevertMs = 8000, action?: AssistantAction) => {
      setMood("warning", text, autoRevertMs, action);
    },
    [setMood]
  );

  const think = useCallback(
    (text?: string) => {
      setMood("thinking", text);
    },
    [setMood]
  );

  const explain = useCallback(
    (text: string, autoRevertMs = 10000, action?: AssistantAction) => {
      setMood("explaining", text, autoRevertMs, action);
    },
    [setMood]
  );

  const cheer = useCallback(
    (text?: string, autoRevertMs = 5000) => {
      setMood("happy", text, autoRevertMs);
    },
    [setMood]
  );

  const welcome = useCallback(
    (text?: string, autoRevertMs = 7000) => {
      setMood("welcome", text, autoRevertMs);
    },
    [setMood]
  );

  return {
    mood,
    message,
    enabled,
    minimized,
    character,
    setMood,
    say,
    celebrate,
    warn,
    think,
    explain,
    cheer,
    welcome,
    resetToIdle,
    setMinimized,
  };
}
