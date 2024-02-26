<script setup>
import {reactive} from "vue";
import HashWorker from '@/workers/hasher.js?worker';
import {ArchiveOutline as ArchiveIcon} from '@vicons/ionicons5'
import EqIcon from "@/components/icons/EqIcon.vue";
import {useMessage} from "naive-ui";
//

let filesInfo = reactive([]);
let selectedFiles = [];
const message = useMessage()

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
    if (selectedFiles.length === 0) {
        message.error('请先选择文件');
        return;
    }
    for (let file of selectedFiles) {
        startSum(type, file.file, file.id);
    }
}

function fileChange(info) {
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

function inFlash(info) {
    return info.currentChunk === 0 || info.currentChunk < info.chunkNum
}

function eq(info) {
    if (info.userInput === '' || info.result === '') {
        return true;
    }
    return info.result === info.userInput.trim().toLowerCase();
}

</script>

<template>
    <main class="flex flex-col items-center container mx-auto pt-8 px-4">
        <n-upload
            multiple
            directory-dnd
            @change="fileChange"
        >
            <n-upload-dragger>
                <div style="margin-bottom: 12px">
                    <n-icon size="48" :depth="3">
                        <archive-icon/>
                    </n-icon>
                </div>
                <n-text style="font-size: 16px">
                    点击或者拖动文件到该区域
                </n-text>
                <n-p depth="3" style="margin: 8px 0 0 0">
                    所有计算均在本地运行，不会上传您的任何文件。
                    <br>
                    您可以选择多个文件或拖动文件夹进来，可以同时校验多个文件。
                </n-p>
            </n-upload-dragger>
        </n-upload>

        <div class="flex gap-4 mt-2 flex-wrap justify-center">
            <n-button type="primary" @click="mutStart('md5')">校验md5</n-button>
            <n-button type="primary" @click="mutStart('sha256')">校验sha256</n-button>
            <n-button type="primary" @click="mutStart('sha1')">校验sha1</n-button>
            <n-button type="primary" @click="mutStart('sha512')">校验sha512</n-button>
        </div>
        <!-- 计算结果 -->
        <div class="mt-10 w-full">
            <n-h2 prefix="bar">计算结果</n-h2>
            <div v-if="filesInfo.length === 0" class="">
                🧘等待工作中...
            </div>
            <n-card v-for="(file, index) in filesInfo"
                    class="mb-4"
                    size="small"
                    :title="'['+file.type+'] '+file.name"
            >
                <template #header-extra>
                    <span v-if="file.useTime" class="px-2">耗时: {{ file.useTime }}ms</span>
                    <span class="green" :class="{flash: inFlash(file)}"></span>
                </template>
                <div class="flex flex-col md:flex-row">
                    <n-input
                        class="flex-auto"
                        :placeholder="getPlaceholder(file)"
                        :value="file.result"
                    >
                    </n-input>
                    <div class="px-2 center py-2 md:py-0">
                        <n-icon size="20" :color="eq(file) ? '' : 'red'">
                            <EqIcon :eq="eq(file)"/>
                        </n-icon>
                    </div>
                    <n-input class="flex-auto" v-model:value="file.userInput" :placeholder="'输入校验'+file.type"></n-input>
                </div>
            </n-card>
        </div>

        <n-card title="快速校验文件工具简介" class="mt-10">
            本工具使用 WebAssembly 技术，使计算速度达到接近原生应用的速度，是传统 JavaScript 计算速度的数倍。且支持多线程并行计算多个文件，可以充分利用多核 CPU 的性能。
            <br>
            本工具不会上传您的任何文件，所有计算均在本地进行。
            <n-h3>使用方法</n-h3>
            <p>1. 选择一个或多个待校验的文件。</p>
            <p>2. 点击您要校验的类型按钮。</p>
            <p>3. 等待计算结果，在等待过程中，您可以在计算结果卡片的右侧输入框填入校验哈希值。（小文件无需等待）</p>
            <p>4. 如果文件的哈希值与您输入的校验哈希值一致则显示等号，否则显示不等号。</p>
            <n-h3>开源项目</n-h3>
            <p>本工具的源码已经开源在 <a href="https://github.com/jethroHuang/fast_hash" target="_blank">Github</a>，欢迎大家提出建议和贡献代码。</p>
        </n-card>
    </main>
</template>

<style scoped>
@keyframes animal-working {
    0% {
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0;
    }
}
.green.flash {
    animation: animal-working 1.5s infinite;
}
.green {
    --ledColor: #00e716;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--ledColor);
    box-shadow: 0 0 6px var(--ledColor);
    display: inline-block;
    position: relative;
    transition: opacity;
}
.green::after {
    content: "";
    width: 5px;
    height: 5px;
    background: #00f616;
    border-radius: 50%;
    display: inline-block;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
}
</style>
