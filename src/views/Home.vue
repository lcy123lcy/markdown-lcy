<template>
  <div class="carousel-container">
    <!-- 图片滑动条 -->
    <div class="carousel-track" :style="trackStyle">
      <div
        v-for="(img, index) in images"
        :key="index"
        class="carousel-slide"
      >
        <img
          :src="img"
          :alt="`照片 ${index + 1}`"
          :loading="index < 3 ? 'eager' : 'lazy'"
          class="carousel-image"
        />
      </div>
    </div>

    <!-- 左右箭头 -->
    <button class="carousel-arrow carousel-arrow-left" @click="prevSlide">
      &#8249;
    </button>
    <button class="carousel-arrow carousel-arrow-right" @click="nextSlide">
      &#8250;
    </button>

    <!-- 底部圆点指示器 -->
    <div class="carousel-dots">
      <button
        v-for="(_, index) in images"
        :key="index"
        class="carousel-dot"
        :class="{ 'carousel-dot-active': index === currentIndex }"
        @click="goToSlide(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const images = [
  '/doudouimg/04E6F34F-A0ED-4E00-9AFE-3C581D4BC3D6_1_105_c.jpeg',
  '/doudouimg/072BB1A2-49E7-4CEA-8EE5-F4D80FCBAB81_1_105_c.jpeg',
  '/doudouimg/07D38903-B42F-40D7-9115-94E9BC2F5CFF_1_105_c.jpeg',
  '/doudouimg/0A3A98D3-3F5F-484E-B7F3-7A6DF6315E41_1_105_c.jpeg',
  '/doudouimg/133839D4-DEE4-4CAC-9C4E-5310EBFC3F3C_1_105_c.jpeg',
  '/doudouimg/13B6170B-C8A2-4803-9D85-B87EFB0BE4A9_1_105_c.jpeg',
  '/doudouimg/29DC2289-6E45-486A-B7F9-6A7853A7564B_1_105_c.jpeg',
  '/doudouimg/29EBFDB7-68D5-4F90-9143-84214C2866AB_1_105_c.jpeg',
  '/doudouimg/31347057-9698-44CE-AB7C-7B65F0FBEA9E_1_105_c.jpeg',
  '/doudouimg/3292ADAE-0DE6-416B-B85B-B3948F0F2E71_1_105_c.jpeg',
  '/doudouimg/360C2A6C-432D-4467-BDCC-4FDD8E3A8270_1_105_c.jpeg',
  '/doudouimg/3F930563-4529-4D03-A5C9-3DDBA3F0FDF4_1_105_c.jpeg',
  '/doudouimg/4624E3F3-1A45-4F22-A5DA-5C509C776879_1_105_c.jpeg',
  '/doudouimg/5301BD22-7EBB-42CF-A728-C99BE4D0C289_1_105_c.jpeg',
  '/doudouimg/5CC82453-A9B8-4F64-818A-CDDFF0AB7F91_1_105_c.jpeg',
  '/doudouimg/5E4F5C25-119D-49F6-9BB7-24F91427262F_1_105_c.jpeg',
  '/doudouimg/80A59D56-2F0B-4439-9792-3DABA7FE99B0_1_105_c.jpeg',
  '/doudouimg/83ED1377-508D-4EB2-9FDD-7FED1C8FC90C_1_105_c.jpeg',
  '/doudouimg/8FE8D3D5-4EF4-4268-8941-0BB85C3519F7_1_105_c.jpeg',
  '/doudouimg/920093E6-4F4F-46B1-9F1C-07BE0466ED22_1_105_c.jpeg',
  '/doudouimg/92FEF8CC-F804-4502-B9E9-A18D6042AD34_1_105_c.jpeg',
  '/doudouimg/A1236C25-F8BD-4B6B-99FD-D4569C56791C_1_105_c.jpeg',
  '/doudouimg/A4F51EE1-DE16-4C28-B2CB-A3430A434CEA_1_105_c.jpeg',
  '/doudouimg/B0490BAE-9585-469C-906F-BBB80459FF96_1_105_c.jpeg',
  '/doudouimg/B073F22F-9252-4728-B886-7D0BC007F4E6_1_105_c.jpeg',
  '/doudouimg/B245A3CE-51B8-4B28-BC7D-FDA9090BBB99_1_105_c.jpeg',
  '/doudouimg/B5A45006-3656-497B-92AD-A1AA022DF7EF_1_105_c.jpeg',
  '/doudouimg/B5DE54C0-6892-4E12-A56E-33FD1E11DA5F_1_105_c.jpeg',
  '/doudouimg/B7C18D18-94CA-41FA-935E-02F38E7B408C_1_105_c.jpeg',
  '/doudouimg/CCA4C9E9-565D-44B7-97BB-95FE12273C62_1_105_c.jpeg',
  '/doudouimg/CEA2B648-7BDC-480C-B99F-82D466E5F183_1_105_c.jpeg',
  '/doudouimg/E1C0B5FA-12CA-467C-9264-F020F73C8D76_1_105_c.jpeg',
  '/doudouimg/E612D8AE-F88E-42A7-917C-BB5B3F9306AA_1_105_c.jpeg',
  '/doudouimg/EC8DD4CB-6851-40FC-8E0B-6F58E47FA6A5_1_105_c.jpeg',
  '/doudouimg/F1B270AD-1706-45E3-9B77-E3AC0AA2BF3B_1_105_c.jpeg',
  '/doudouimg/F3706D61-E25D-4DE5-BEAD-DB5AF1AE70EC_1_105_c.jpeg',
  '/doudouimg/F5E4773B-5552-4C51-833E-142D1E7F8A2E_1_105_c.jpeg',
]

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const trackStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * 100}vw)`,
  transition: 'transform 0.5s ease-in-out',
}))

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % images.length
  resetTimer()
}

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length
  resetTimer()
}

function goToSlide(index: number) {
  currentIndex.value = index
  resetTimer()
}

function startTimer() {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length
  }, 5000)
}

function resetTimer() {
  if (timer) {
    clearInterval(timer)
  }
  startTimer()
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.carousel-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
}

.carousel-track {
  display: flex;
  height: 100%;
  will-change: transform;
}

.carousel-slide {
  min-width: 100vw;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  font-size: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background 0.2s;
  z-index: 10;
}

.carousel-arrow:hover {
  background: rgba(0, 0, 0, 0.7);
}

.carousel-arrow-left {
  left: 20px;
}

.carousel-arrow-right {
  right: 20px;
}

.carousel-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.carousel-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}

.carousel-dot:hover {
  background: rgba(0, 0, 0, 0.5);
}

.carousel-dot-active {
  background: rgba(0, 0, 0, 0.8);
}
</style>
