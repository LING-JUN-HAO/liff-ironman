<template>
    <div class="canvas-container">
        <div class="canvas-instance" ref="scratchCard"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import p5, { Graphics } from "p5";

// 定義 props
interface Props {
    autoRevealThreshold?: number; // 進度百分比，超過此值自動揭曉
    brushSize?: number; // 刮刮樂刷子大小
    prizeText?: string; // 獎品主要文字
    prizeSubtext?: string; // 獎品副標題
    prizeAmount?: string; // 獎品金額或描述
    coverText?: string; // 刮刮樂覆蓋層主要文字
    coverSubtext?: string; // 刮刮樂覆蓋層副標題
}

const props = withDefaults(defineProps<Props>(), {
    autoRevealThreshold: 50,
    brushSize: 40,
    prizeText: "🎉 恭喜中獎！",
    prizeSubtext: "您獲得了大獎",
    prizeAmount: "✨ 鐵人卷 20,000 元",
    coverText: "屬於你的幸運抽獎",
    coverSubtext: "看看有什麼好禮！",
});

const emit = defineEmits<{
    onCompleted: [data: { progress: number; message: string }] // 當遊戲完成時觸發
}>();

const scratchCard = ref<HTMLDivElement | null>(null);

let p5Instance: p5 | null = null;

let gameState = {
    isRevealed: false, // 是否已經揭曉獎品
    lastProgressCheck: 0, // 上次進度檢查時間
    currentProgress: 0  // 當前刮開進度百分比
};

onMounted(() => {
    initGame();
});

const initGame = () => {
    const sketch = (s: p5) => {
        let bg: Graphics, cover: Graphics;
        let canvasWidth: number, canvasHeight: number;
        const progressCheckInterval = 100; // ms
        const sampleStep = 15;

        s.setup = () => {
            if (scratchCard.value === null) {
                console.error("Canvas container is not available");
                return;
            }

            canvasWidth = scratchCard.value.clientWidth;
            canvasHeight = scratchCard.value.clientHeight;

            const canvas = s.createCanvas(canvasWidth, canvasHeight);
            canvas.parent(scratchCard.value!);
            bg = s.createGraphics(canvasWidth, canvasHeight);
            cover = s.createGraphics(canvasWidth, canvasHeight);

            createFallbackBackground();
            resetCover();
        };

        // 建立漸層背景(刮開後可見)
        function createFallbackBackground() {
            for (let y = 0; y < canvasHeight; y++) {
                const alpha = s.map(y, 0, canvasHeight, 0, 1);
                bg.stroke(s.lerpColor(s.color(200, 220, 255), s.color(255, 200, 220), alpha));
                bg.line(0, y, canvasWidth, y);
            }
            addTextOverlay();
        }

        // 在背景上添加文字(刮開後可見)
        function addTextOverlay() {
            const padding = 20;
            const boxX = padding;
            const boxY = canvasHeight * 0.3;
            const boxW = canvasWidth - padding * 2;
            const boxH = canvasHeight * 0.4;

            // 半透明背景
            bg.fill(0, 0, 0, 80);
            bg.rect(boxX, boxY, boxW, boxH, 16);

            // 主要文字
            bg.textAlign(s.CENTER, s.CENTER);
            bg.fill(255);
            bg.stroke(0);
            bg.strokeWeight(2);

            // 獎品標題
            bg.textSize(Math.min(canvasWidth * 0.12, 42));
            bg.text(props.prizeText, canvasWidth / 2, canvasHeight / 2 - 50);

            // 副標題
            bg.textSize(Math.min(canvasWidth * 0.07, 24));
            bg.text(props.prizeSubtext, canvasWidth / 2, canvasHeight / 2 + 10);

            // 獎品金額
            bg.textSize(Math.min(canvasWidth * 0.08, 26));
            bg.fill(255, 215, 0);
            bg.noStroke();
            bg.text(props.prizeAmount, canvasWidth / 2, canvasHeight / 2 + 70);
        }

        s.draw = () => {
            s.image(bg, 0, 0, canvasWidth, canvasHeight);
            if (!gameState.isRevealed) {
                s.image(cover, 0, 0, canvasWidth, canvasHeight);
            }
        };

        function scratch(x: number, y: number) {
            if (!gameState.isRevealed && x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight) {
                cover.erase();

                // 軟邊緣刮除效果
                cover.ellipse(x, y, props.brushSize, props.brushSize);

                // 添加額外的小圓點增加真實感
                for (let i = 0; i < 3; i++) {
                    const offsetX = s.random(-props.brushSize / 4, props.brushSize / 4);
                    const offsetY = s.random(-props.brushSize / 4, props.brushSize / 4);
                    cover.ellipse(x + offsetX, y + offsetY, props.brushSize / 2, props.brushSize / 2);
                }

                cover.noErase();

                // 限制進度檢查頻率
                const now = Date.now();
                if (now - gameState.lastProgressCheck > progressCheckInterval) {
                    calculateProgress();
                    gameState.lastProgressCheck = now;
                }
            }
        }

        function calculateProgress() {
            cover.loadPixels();
            let scratched = 0;
            let total = 0;

            // 採樣檢查透明度
            for (let x = sampleStep / 2; x < cover.width; x += sampleStep) {
                for (let y = sampleStep / 2; y < cover.height; y += sampleStep) {
                    const index = (Math.floor(y) * cover.width + Math.floor(x)) * 4 + 3;
                    if (index >= 0 && index < cover.pixels.length) {
                        total++;
                        if (cover.pixels[index] < 128) {
                            scratched++;
                        }
                    }
                }
            }

            const progress = total > 0 ? (scratched / total) * 100 : 0;
            gameState.currentProgress = progress;

            if (progress > props.autoRevealThreshold && !gameState.isRevealed) {
                revealAll();
            }
        }

        function revealAll() {
            gameState.isRevealed = true;

            // 發送完成事件到父組件
            const completionData = {
                progress: 100,
                message: `恭喜你獲得\n${props.prizeAmount}！`
            };

            emit('onCompleted', completionData);
        }

        function resetCover() {
            // 漸層背景效果
            const gradient = cover.drawingContext.createLinearGradient(0, 0, canvasWidth, canvasHeight);
            gradient.addColorStop(0, '#E8E8E8');
            gradient.addColorStop(0.5, '#F0F0F0');
            gradient.addColorStop(1, '#E8E8E8');

            cover.drawingContext.fillStyle = gradient;
            cover.drawingContext.fillRect(0, 0, canvasWidth, canvasHeight);

            // 主標題
            cover.textAlign(s.CENTER, s.CENTER);
            cover.textSize(Math.min(canvasWidth * 0.09, 32));
            cover.textFont('Arial');
            cover.fill(80);
            cover.noStroke();
            cover.text(props.coverText, canvasWidth / 2, canvasHeight / 2 - 20);

            // 副標題
            cover.textSize(Math.min(canvasWidth * 0.07, 24));
            cover.fill(120);
            cover.text(props.coverSubtext, canvasWidth / 2, canvasHeight / 2 + 25);

        }

        // 觸控事件
        s.touchStarted = (event?: Event) => {
            event?.preventDefault();
            if (s.mouseX >= 0 && s.mouseX < canvasWidth && s.mouseY >= 0 && s.mouseY < canvasHeight) {
                scratch(s.mouseX, s.mouseY);
            }
            return false;
        };

        s.touchMoved = (event?: Event) => {
            event?.preventDefault();
            if (s.mouseX >= 0 && s.mouseX < canvasWidth && s.mouseY >= 0 && s.mouseY < canvasHeight) {
                scratch(s.mouseX, s.mouseY);
            }
            return false;
        };
    };

    p5Instance = new (p5)(sketch);
};

onBeforeUnmount(() => {
    p5Instance?.remove();
});
</script>

<style scoped>
.canvas-container {
    width: 100%;
    height: 100dvh;
    height: 100vh;
    position: relative;
    overflow: hidden;
    touch-action: none;
    user-select: none;
}

.canvas-instance {
    width: 100%;
    height: 100dvh;
    height: 100vh;
}
</style>