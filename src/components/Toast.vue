<template>
    <div v-if="show" class="toast" :class="type">
        <strong>{{ title }}</strong>
        <br>{{ text }}
    </div>
</template>

<script setup lang="ts">
interface Props {
    show: boolean;
    title: string;
    text: string;
    type: 'success' | 'error';
}

defineProps<Props>();
</script>

<style scoped>
.toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 90%;
    text-align: center;
    color: white;
    animation: toastSlideIn 0.3s ease-out;
}

@keyframes toastSlideIn {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}

.toast.success {
    background: #4CAF50;
}

.toast.error {
    background: #f44336;
}
</style>