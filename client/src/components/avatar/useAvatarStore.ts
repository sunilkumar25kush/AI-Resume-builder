import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_AVATAR_ID, getAvatarCharacter, type AvatarCharacter } from "./avatarDefinitions";
import { ASSISTANT_MOODS, type AssistantMood } from "./assistantMoods";

export interface AssistantAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline";
}

interface AvatarStoreState {
  characterId: string;
  enabled: boolean;
  minimized: boolean;
  mood: AssistantMood;
  message: string | null;
  action: AssistantAction | null;
  revertTimer: ReturnType<typeof setTimeout> | null;

  // Actions
  setCharacterId: (id: string) => void;
  getCharacter: () => AvatarCharacter;
  setEnabled: (enabled: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  toggleMinimized: () => void;
  setMood: (mood: AssistantMood, message?: string | null, autoRevertMs?: number, action?: AssistantAction | null) => void;
  say: (message: string, mood?: AssistantMood, autoRevertMs?: number, action?: AssistantAction | null) => void;
  resetToIdle: () => void;
}

export const useAvatarStore = create<AvatarStoreState>()(
  persist(
    (set, get) => ({
      characterId: DEFAULT_AVATAR_ID,
      enabled: true,
      minimized: false,
      mood: "idle",
      message: null,
      action: null,
      revertTimer: null,

      setCharacterId: (characterId: string) => set({ characterId }),

      getCharacter: () => getAvatarCharacter(get().characterId),

      setEnabled: (enabled: boolean) => set({ enabled }),

      setMinimized: (minimized: boolean) => set({ minimized }),

      toggleMinimized: () => set((state) => ({ minimized: !state.minimized })),

      setMood: (mood: AssistantMood, message?: string | null, autoRevertMs?: number, action?: AssistantAction | null) => {
        const { revertTimer } = get();
        if (revertTimer) clearTimeout(revertTimer);

        let newTimer: ReturnType<typeof setTimeout> | null = null;
        if (autoRevertMs && autoRevertMs > 0) {
          newTimer = setTimeout(() => {
            set({ mood: "idle", message: null, action: null, revertTimer: null });
          }, autoRevertMs);
        }

        set({
          mood,
          message: message !== undefined ? message : ASSISTANT_MOODS[mood]?.defaultMessage ?? null,
          action: action ?? null,
          revertTimer: newTimer,
        });
      },

      say: (message: string, mood?: AssistantMood, autoRevertMs?: number, action?: AssistantAction | null) => {
        get().setMood(mood || "explaining", message, autoRevertMs, action);
      },

      resetToIdle: () => {
        const { revertTimer } = get();
        if (revertTimer) clearTimeout(revertTimer);
        set({ mood: "idle", message: null, action: null, revertTimer: null });
      },
    }),
    {
      name: "arb-avatar-assistant",
      partialize: (state) => ({
        characterId: state.characterId,
        enabled: state.enabled,
        minimized: state.minimized,
      }),
    },
  ),
);

