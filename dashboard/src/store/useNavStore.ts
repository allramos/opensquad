import { create } from "zustand";

export type Page = "dashboard" | "monitor" | "squads" | "skills" | "runs" | "settings";

interface NavStore {
  currentPage: Page;
  navigate: (page: Page) => void;
}

export const useNavStore = create<NavStore>((set) => ({
  currentPage: "dashboard",
  navigate: (page) => set({ currentPage: page }),
}));
