import * as wasm from "hash-wasm?a=2"

wasm.set_panic_hook();

/**
 * 发送进度
 * @param chunkNr 文件分块序号，从1开始
 * @param chunks 文件分块总数
 */
function sendProgress(chunkNr, chunks) {
    postMessage({
        type: "progress",
        data: {
            chunkNr,
            chunks
        }
    });
}

/**
 * 发送结果
 * @param result {String} 计算结果
 */
function sendResult(result) {
    postMessage({
        type: "result",
        data: result
    });
}


/**
 * 计算文件散列值
 * @param file {File} 文件
 * @param hasher {Object} hasher对象
 */
function shaSum(file, hasher) {
    // 将文件按50M分割
    const chunkSize = 50 * 1024 * 1024;
    // 计算文件分块总数
    const chunks = Math.ceil(file.size / chunkSize);
    // 当前分块序号
    let currentChunk = 0;

    // 对文件进行分块读取
    let fileReader = new FileReader();

    // 加载下一块
    function loadNext() {
        const start = currentChunk * chunkSize;
        const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(file.slice(start, end));
    }

    // 读取文件完成
    fileReader.onload = function (e) {
        hasher.update(new Uint8Array(e.target.result)); // 计算这一块的散列值
        sendProgress(currentChunk + 1, chunks); // 发送进度
        currentChunk++;
        if (currentChunk < chunks) {
            loadNext(); // 继续加载下一块
        } else {
            sendResult(hasher.digest()); // 发送结果
            hasher.free(); // 释放内存
        }
    };

    // 加载第一块
    loadNext();
}

// 接收主线程的消息
onmessage = function (e) {
    let {
        type = "md5",
        file
    } = e.data;
    switch (type) {
        case "md5":
            shaSum(file, wasm.Md5Hasher.new());
            break;
        case "sha256":
            shaSum(file, wasm.Sha256Hasher.new());
            break;
        case "sha1":
            shaSum(file, wasm.Sha1Hasher.new());
            break;
        case "sha512":
            shaSum(file, wasm.Sha512Hasher.new());
            break;
        default:
            console.error("unknow type", type);
    }
}

// 发送 ready 消息
postMessage({
    type: "ready"
})
