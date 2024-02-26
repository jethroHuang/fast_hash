<script setup>
import {defineProps} from "vue"
const props = defineProps({
    eq: Boolean
})
let dashoffset = ref(props.eq ? 100 : 0)
watch(() => props.eq, (val) => {
    dashoffset.value = dashoffset.value - 100;
})
</script>

<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" class="animate-line">
        <line id="svg_5" y2="27" x2="80" y1="27" x1="0" stroke-width="6" stroke="currentColor"/>
        <line id="svg_7" y2="53" x2="80" y1="53" x1="0" stroke-width="6" stroke="currentColor"/>
        <line
            stroke="currentColor"
            id="svg_8"
            y2="75" x2="10" y1="4.25" x1="70.25"
            stroke-width="8"
            stroke-dasharray="100 100"
            :stroke-dashoffset="dashoffset"
        >
        </line>
    </svg>
</template>
<style scoped>
.animate-line line{
    transition: all 0.3s ease-in-out;
}
</style>
