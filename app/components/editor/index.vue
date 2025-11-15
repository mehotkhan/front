<script setup lang="ts">
const props = defineProps({
  body: { type: String, required: false, default: "" },
});

const emit = defineEmits<{ (e: "update", value: string): void }>();

const content = ref(props.body);

watch(() => props.body, (newBody) => {
  content.value = newBody;
});

watch(content, (newContent) => {
  emit("update", newContent);
});
</script>

<template>
  <div class="relative">
    <USeparator class="mt-5" />
    
    <!-- Simple Markdown Editor -->
    <UTextarea
      v-model="content"
      class="w-full min-h-[30rem] mt-5 font-mono text-sm"
      autoresize
      :rows="30"
      :placeholder="$t('Type Something...')"
    />
  </div>
</template>

<style lang="scss">
/* Simple editor styles */
textarea {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  line-height: 1.6;
  tab-size: 2;
}
</style>
