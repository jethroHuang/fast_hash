<script setup>
import {ref, reactive} from "vue";
import HashWorker from '@/workers/hasher.js?worker';
import { ArchiveOutline as ArchiveIcon, ReorderTwoSharp } from '@vicons/ionicons5'
//

let filesInfo = reactive([]);

let selectedFiles = [];

function startSum(type, file, id) {
    let worker = new HashWorker();
    let startTime = Date.now();
    let info = reactive({
        id,
        type,
        worker,
        chunkNum: 0,
        currentChunk: 0,
        result: '',
        useTime: 0,
        name: file.name,
        userInput: '',
    })
    filesInfo.push(info);
    let hashType = type;
    worker.onmessage = function (e) {
        const {data, type} = e.data;
        if (type === 'progress') {
            info.currentChunk = data.chunkNr;
            info.chunkNum = data.chunks;
        } else if (type === 'result') {
            info.result = data;
            let endTime = Date.now();
            info.useTime = endTime - startTime;
            worker.terminate(); // 关闭worker
        } else if (type === 'ready') {
            worker.postMessage({file, type: hashType});
        }
    }

}

function mutStart(type) {
    for (let file of selectedFiles) {
        startSum(type, file.file, file.id);
    }
}

function fileChange(info) {
    console.log(info)
    selectedFiles = info.fileList;
}

function getPlaceholder(info) {
    if (info.result) {
        return `计算完成，耗时${info.useTime}ms`;
    } else {
      if (info.currentChunk > 0) {
        return `正在计算${info.type}...(${info.currentChunk}/${info.chunkNum})`;
      } else {
        return "正在准备中..."
      }
    }
}

</script>

<template>
    <main class="flex flex-col items-center container mx-auto pt-8">
        <n-upload
            multiple
            directory-dnd
            @change="fileChange"
        >
            <n-upload-dragger>
                <div style="margin-bottom: 12px">
                    <n-icon size="48" :depth="3">
                        <archive-icon />
                    </n-icon>
                </div>
                <n-text style="font-size: 16px">
                    点击或者拖动文件到该区域
                </n-text>
                <n-p depth="3" style="margin: 8px 0 0 0">
                    所有计算操作均在本地运行，不会上传你的任何文件。
                </n-p>
            </n-upload-dragger>
        </n-upload>

        <div class="flex gap-4 mt-2">
            <n-button type="primary" @click="mutStart('md5')">获取md5</n-button>
            <n-button type="primary" @click="mutStart('sha256')">获取sha256</n-button>
            <n-button type="primary" @click="mutStart('sha1')">获取sha1</n-button>
            <n-button type="primary" @click="mutStart('sha512')">获取sha512</n-button>
        </div>

        <div class="mt-10 w-full" v-if="filesInfo.length">
            <n-h2 prefix="bar">计算结果</n-h2>
            <n-card v-for="(file, index) in filesInfo"
                    class="mb-4"
                    size="small"
                    :title="'['+file.type+']'+file.name"
            >
              <template #header-extra v-if="file.useTime">
                耗时: {{file.useTime}}ms
              </template>
                <div class="flex">
                    <n-input
                        class="flex-auto"
                        :placeholder="getPlaceholder(file)"
                        :value="file.result"
                    >
                    </n-input>
                    <div class="px-2 center">
                        <n-icon size="20">
                            <ReorderTwoSharp/>
                        </n-icon>
                    </div>
                    <n-input class="flex-auto" v-model="file.userInput"></n-input>
                </div>
            </n-card>
        </div>
    </main>
</template>

<style scoped>

</style>
