import { create } from "zustand";
import { api } from "@/lib/api";

import en from "@/locales/en.json";
import ptBR from "@/locales/pt-BR.json";
import es from "@/locales/es.json";

type Strings = Record<string, string>;

const LOCALES: Record<string, Strings> = {
  en,
  "pt-BR": ptBR,
  es,
};

// Map language labels (from preferences) to locale codes
const LANG_MAP: Record<string, string> = {
  English: "en",
  "Português (Brasil)": "pt-BR",
  Español: "es",
};

interface I18nStore {
  locale: string;
  strings: Strings;
  loaded: boolean;
  setLocale: (locale: string) => void;
  loadFromPreferences: () => Promise<void>;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

export const useI18nStore = create<I18nStore>((set, get) => ({
  locale: "en",
  strings: en,
  loaded: false,

  setLocale: (localeOrLabel: string) => {
    const code = LANG_MAP[localeOrLabel] ?? localeOrLabel;
    const strings = LOCALES[code] ?? en;
    set({ locale: code, strings });
  },

  loadFromPreferences: async () => {
    try {
      const prefs = await api.getPreferences();
      const lang = prefs.language || "English";
      const code = LANG_MAP[lang] ?? "en";
      const strings = LOCALES[code] ?? en;
      set({ locale: code, strings, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  t: (key: string, vars?: Record<string, string | number>) => {
    let str = get().strings[key] ?? en[key as keyof typeof en] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.split(`{${k}}`).join(String(v));
      }
    }
    return str;
  },
}));
