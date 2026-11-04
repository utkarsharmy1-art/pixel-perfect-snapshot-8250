import { useSyncExternalStore } from "react";

export type ChatMsg = { role: "user" | "assistant"; content: string };
export type Lang = "English" | "Hindi" | "Marathi";

type State = { open: boolean; messages: ChatMsg[]; language: Lang; pending: string | null };
let state: State = { open: false, messages: [], language: "English", pending: null };
const listeners = new Set<() => void>();

export const chatStore = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** Open the floating panel, optionally queueing a question to send. */
  openWith(question?: string) {
    chatStore.set({ open: true, pending: question ?? null });
  },
};

const serverState = state;
export function useChat() {
  return useSyncExternalStore(chatStore.subscribe, chatStore.get, () => serverState);
}
