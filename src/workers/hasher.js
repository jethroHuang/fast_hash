import * as wasm from "hash_wasm?a=2"

wasm.set_panic_hook();

function sendProgress(chunkNr, chunks) {
    postMessage({
        type: "progress",
        data: {
            chunkNr,
            chunks
        }
    });
}

function sendResult(result) {
    postMessage({
        type: "result",
        data: result
    });
}

function shaSum(file, spark) {
    // 将文件按50M分割
    const chunkSize = 50 * 1024 * 1024;
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    let fileReader = new FileReader();

    // console.log("file size", file.size, "chunks", chunks, "chunkSize", chunkSize);

    function loadNext() {
        const start = currentChunk * chunkSize;
        const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
        fileReader.readAsArrayBuffer(file.slice(start, end));
    }

    fileReader.onload = function (e) {
        spark.update(new Uint8Array(e.target.result)); // 计算MD5
        sendProgress(currentChunk + 1, chunks);
        currentChunk++;
        if (currentChunk < chunks) {
            loadNext();
        } else {
            sendResult(spark.digest());
            spark.free();
        }
    };

    loadNext();
}

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

postMessage({
    type: "ready"
})
