<script setup lang="ts">
defineProps({
    show: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['update:show'])
const handle_emit = () => {
    emit('update:show')
}
</script>

<template>
    <div v-if="show" class=" fixed top-0 left-0 w-screen h-screen flex justify-center">
        <div class="flex flex-col justify-center">
            <div class=" rounded-xl p-8 bg-base-100 space-y-8">
                <div class="  flex justify-between items-center space-x-8">
                    <span class="text-2xl">{{ title }}</span>
                    <button className="btn btn-circle btn-ghost" @click="handle_emit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="size-8 text-red-500">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                    </button>
                </div>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style></style>