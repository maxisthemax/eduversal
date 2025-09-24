/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import translation_zhCN from "./translation_zh-CN";
import { includes, keys, find, replace, trim, orderBy } from "lodash";

export interface Language {
  name: string;
  code: string;
}

export const languageList: Language[] = [
  {
    name: "English",
    code: "en",
  },
  {
    name: "Chinese",
    code: "zh-CN",
  },
];

export function useTranslation() {
  const [language, setLanguage] = useLocalStorage<Language>(
    "language",
    languageList[0]
  );

  return { language, setLanguage };
}

export function t(field: string): string {
  const storedValue =
    typeof window !== "undefined"
      ? localStorage.getItem("language")
      : JSON.stringify(languageList[0]);
  const language: Language = storedValue ? JSON.parse(storedValue) : undefined;

  if (field === " ") {
    if (language.code === "en") return " ";
    else if (language.code === "zh-CN") return "";
    else return "";
  }

  if (!language) return field;
  if (language.code === "en") return field;

  let translationJson: Record<string, string> | undefined;
  switch (language.code) {
    case "zh-CN":
      translationJson = translation_zhCN;
      break;

    default:
      return trim(field);
  }
  let translatedText = translationJson?.[trimColons(trim(field))];

  if (!translatedText) {
    const found = find(
      orderBy(keys(translationJson), [(str) => str.length], ["desc"]),
      (id) => {
        return includes(field, id);
      }
    );
    if (found) {
      const findTranslate = translationJson[trimColons(trim(found))];
      translatedText = replace(field, found, findTranslate);
    }
  }

  switch (language.code) {
    case "zh-CN":
      if (includes(field, "is Required")) {
        translatedText =
          "必须填写" + replace(translatedText, "is Required", "");
      }

      if (includes(field, "is required")) {
        translatedText =
          "必须填写" + replace(translatedText, "is required", "");
      }

      break;

    default:
  }

  return translatedText ?? field;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  disabledLocalStorage = false
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Function to get the initial value
  const getInitialValue = (): T => {
    if (!disabledLocalStorage && typeof window !== "undefined") {
      // Check if the key exists in localStorage
      const storedValue = localStorage.getItem(key);
      // If the key exists, parse the stored JSON value; otherwise, return the initial value
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } else return initialValue;
  };

  // Create state using the initial value
  const [value, setValue] = useState<T>(getInitialValue);

  useEffect(() => {
    if (!disabledLocalStorage && typeof window !== "undefined") {
      // Update localStorage whenever the state changes
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value, disabledLocalStorage]);

  return [value, setValue];
}

function trimColons(str: string): string {
  return str.replace(/^:+|:+$/g, "");
}

export function translateArrayMap(array: any[], keys: string[]) {
  return array
    .filter((item) => item)
    .map((item) => {
      const translatedItem = { ...item };
      keys.forEach((key) => {
        translatedItem[key] = t(item?.[key]);
      });
      return translatedItem;
    });
}
