import type { Liff } from "@line/liff";

export type UserEnvironment = {
  os: ReturnType<Liff["getOS"]>;
  appLanguage: ReturnType<Liff["getAppLanguage"]>;
  language: ReturnType<Liff["getLanguage"]>;
  liffSDKVersion: ReturnType<Liff["getVersion"]>;
  lineVersion: ReturnType<Liff["getLineVersion"]> | null;
  getContext: ReturnType<Liff["getContext"]>;
  isInClient: ReturnType<Liff["isInClient"]>;
  isLoggedIn: ReturnType<Liff["isLoggedIn"]>;
  isApiAvailable: boolean;
};
