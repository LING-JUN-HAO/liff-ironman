<template>
  <div id="app">
    <ScratchCard @onCompleted="handleScratchComplete" />

    <!-- 中獎彈窗 -->
    <PrizeModal :show="showModal" :message="prizeMessage" :canShare="canShare" @share="handleShare"
      @close="handleClose" />

    <!-- 結果提示 -->
    <Toast :show="showToastVisible" :title="toastTitle" :text="toastText" :type="toastType" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import liff from "@line/liff";
import ScratchCard from "./components/ScratchCard.vue";
import PrizeModal from "./components/PrizeModal.vue";
import Toast from "./components/Toast.vue";


const showModal = ref(false);
const prizeMessage = ref('');
const showToastVisible = ref(false);
const toastTitle = ref('');
const toastText = ref('');
const toastType = ref<'success' | 'error'>('success');
const canShare = ref(false);

/** 發送 LINE 訊息 */
const sendLineMessage = async (message: string): Promise<void> => {
  await liff.sendMessages([
    {
      type: "text",
      text: `🎉 ${message}\n感謝您參與我們的活動！`
    }
  ]);
};

/** 分享訊息到 LINE */
const shareToLine = async (message: string): Promise<void> => {
  const liffUrl = `https://liff.line.me/${import.meta.env.VITE_LIFF_ID}`;

  await liff.shareTargetPicker([
    {
      type: "text",
      text: message
    },
    {
      type: "template",
      altText: "刮刮卡活動邀請",
      template: {
        type: "buttons",
        text: "你也來挑戰刮刮卡吧！",
        actions: [
          {
            type: "uri",
            label: "立即參加抽獎",
            uri: liffUrl
          }
        ]
      }
    }
  ]);
};

/** 顯示中獎訊息彈窗 */
const showPrizeMessage = (message: string) => {
  prizeMessage.value = message;
  showModal.value = true;
};

/** 顯示結果訊息 Toast */
const showToast = (title: string, text: string, type: 'success' | 'error' = 'success') => {
  toastTitle.value = title;
  toastText.value = text;
  toastType.value = type;
  showToastVisible.value = true;

  setTimeout(() => {
    showToastVisible.value = false;
  }, 1500);
};

/** 處理分享按鈕點擊 */
const handleShare = async () => {
  showModal.value = false;

  try {
    await shareToLine(prizeMessage.value);
    showToast('分享成功！', '訊息已分享到 LINE');
  } catch (error) {
    console.error('分享失敗:', error);
    showToast('分享失敗', '請稍後再試', 'error');
  } finally {
    closeLiffWindow(1500);
  }
};

/** 處理關閉按鈕點擊 */
const handleClose = () => {
  showModal.value = false;
  liff.closeWindow();
};

/** 驗證用戶裝置及執行環境 */
const validateEnvironment = async (): Promise<boolean> => {
  const userOS = liff.getOS();
  if (!liff.isInClient() || userOS === 'web') {
    await showErrorDialog('請在 LINE 應用程式中開啟此活動');
    closeLiffWindow(3000);
    return false;
  }

  return true;
};

/** 關閉 LIFF 視窗 */
const closeLiffWindow = (delay: number = 2000): void => {
  setTimeout(() => {
    liff.closeWindow();
  }, delay);
};

/** 顯示錯誤訊息 */
const showErrorDialog = async (message: string = '處理您的請求時發生問題，請重新嘗試'): Promise<void> => {
  showToast('發生錯誤', message, 'error');
};

/** 檢查並處理用戶登入狀態 */
const checkLoginStatus = (): void => {
  if (!liff.isLoggedIn()) {
    liff.login();
  }
};

/** 檢查是否支援分享功能 */
const checkShareAvailability = (): boolean => {
  const isAvailable = liff.isApiAvailable('shareTargetPicker');

  if (!isAvailable) {
    showToast('提醒用戶！分享功能不可用', '需要更新 LINE 版本', 'error');
  }

  canShare.value = isAvailable;
  return isAvailable;
};

/** 初始化 LIFF */
const initializeLiff = async (): Promise<void> => {
  try {
    // 初始化 LIFF SDK
    await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

    // 檢查用戶登入狀態
    checkLoginStatus();

    // 驗證執行環境
    const isValidEnvironment = await validateEnvironment();
    if (!isValidEnvironment) {
      return;
    }

    // 檢查分享功能可用性（非阻斷性檢查）
    checkShareAvailability();

  } catch (error) {
    console.error("LIFF 初始化失敗:", error);
    showToast('初始化失敗', '請重新整理頁面', 'error');
  }
};

/** 處理刮刮卡完成事件 */
const handleScratchComplete = async (data: { progress: number; message: string }): Promise<void> => {
  try {
    await sendLineMessage(data.message);
    showPrizeMessage(data.message);
  } catch (error) {
    console.error('處理完成訊息時發生錯誤:', error);
    showToast('操作失敗', '請稍後再試', 'error');
  }
};

onMounted(() => {
  initializeLiff();
});
</script>

<style scoped>
body {
  margin: 0;
  padding: 0;
}
</style>
