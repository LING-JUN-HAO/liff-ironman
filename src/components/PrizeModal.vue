<template>
    <div v-if="show" class="modal-overlay" @click="handleBackdropClick">
        <div class="modal-content" @click.stop>
            <div class="prize-icon">🎉</div>
            <h2 class="prize-title">恭喜中獎！</h2>
            <p class="prize-message">{{ message }}</p>
            <div class="button-group">
                <button v-if="canShare" class="share-button" @click="handleShare" @touchstart="handleShare">
                    分享
                </button>
                <button class="close-button" @click="handleClose" @touchstart="handleClose">
                    關閉
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    show: boolean;
    message: string;
    canShare?: boolean; // 控制分享按鈕顯示
}

interface Emits {
    (e: 'share'): void;
    (e: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleShare = () => {
    emit('share');
};

const handleClose = () => {
    emit('close');
};

const handleBackdropClick = () => {
    emit('close');
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.modal-content {
    background: white;
    padding: 25px;
    border-radius: 15px;
    text-align: center;
    width: 90%;
    max-width: 320px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.prize-icon {
    font-size: 48px;
    margin-bottom: 20px;
}

.prize-title {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 20px;
    font-weight: bold;
}

.prize-message {
    margin: 0 0 30px 0;
    color: #666;
    font-size: 14px;
    line-height: 1.5;
}

.button-group {
    display: flex;
    gap: 15px;
}

.share-button,
.close-button {
    flex: 1;
    border: none;
    padding: 15px 25px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-user-select: none;
    user-select: none;
    min-height: 44px;
    transition: all 0.2s ease;
}

.share-button {
    background: #00C300;
    color: white;
}

.share-button:hover,
.share-button:active {
    background: #00A000;
    transform: scale(0.98);
}

.close-button {
    background: #999;
    color: white;
}

.close-button:hover,
.close-button:active {
    background: #777;
    transform: scale(0.98);
}
</style>