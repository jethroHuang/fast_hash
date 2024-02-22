<script setup>
import {ref} from "vue";
import HashWorker from '@/workers/hasher.js?worker';
//
const worker = new HashWorker()

let chunkNum = ref(0);
let currentChunk = ref(0);
let result = ref('');
let useTime = ref(0);

let startTime = 0;

async function getMd5() {
    const file = document.getElementById('file').files[0];
    worker.postMessage({file, type: 'md5'});
    startTime = Date.now();
}

async function getSha256() {
    const file = document.getElementById('file').files[0];
    worker.postMessage({file, type: 'sha256'});
    startTime = Date.now();
}

worker.onmessage = function (e) {
    const {data, type} = e.data;
    if (type === 'progress') {
        currentChunk.value = data.chunkNr;
        chunkNum.value = data.chunks;
    } else if (type === 'result') {
        result.value = data;
        let endTime = Date.now();
        useTime.value = endTime - startTime;
    }
}


</script>

<template>
    <div class="flex flex-col items-center justify-center w-full h-svh">
        <input type="file" id="file">
        <p>处理进度: {{currentChunk}} / {{chunkNum}}</p>
        <p>结果: {{result}}</p>
        <p>耗时: {{useTime}}ms</p>
        <div class="flex gap-2 mt-2">
            <button class="btn" @click="getMd5">获取md5</button>
            <button class="btn" @click="getSha256">获取sha256</button>
        </div>
    </div>
</template>

<style scoped>

</style>
