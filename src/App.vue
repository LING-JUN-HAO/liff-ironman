<template>
  <div id="app">
    <div v-for="(value, key) in message" :key="key" class="text">
      <p>{{ key }}：{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UserEnvironment } from './types';
import liff from "@line/liff";

const message = ref<UserEnvironment | null>(null);

const getLiffData = (): UserEnvironment => {
  const {
    getOS,
    getAppLanguage,
    getLanguage,
    getVersion,
    getLineVersion,
    getContext,
    isInClient,
    isLoggedIn,
    isApiAvailable
  } = liff;
  return {
    os: getOS(), // 作業系統名稱：ios, android, or web
    appLanguage: getAppLanguage(), // LIFF 應用程式語言
    language: getLanguage(), // Liff 執行環境的語言設定(瀏覽器或是系統語言設定)
    liffSDKVersion: getVersion(), // LIFF SDK 版本
    lineVersion: getLineVersion(), // LINE App 版本
    getContext: getContext(), // LIFF 執行環境(one-on-one chat ID, group ID, and room ID)
    isInClient: isInClient(), // 是否在 LIFF 瀏覽器執行(不是代表在一般瀏覽器執行)
    isLoggedIn: isLoggedIn(), // 是否已登入 LINE 帳號(LIFF 瀏覽器通常會預設登入)
    isApiAvailable: isApiAvailable('shareTargetPicker') // 是否可以使用 shareTargetPicker LIFF API(舉例)
  }
}

const handleUserLogin = () => {
  if (!liff.isLoggedIn()) {
    liff.login()
  }
}

onMounted(async () => {
  try {
    await liff.init({
      liffId: import.meta.env.VITE_LIFF_ID,
    });
    handleUserLogin();
    message.value = getLiffData()
  } catch (error) {
    console.error('LIFF 初始化失敗', error);
  }
});
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
</style>
