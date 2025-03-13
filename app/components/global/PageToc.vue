<script setup lang="ts">
defineProps({
  body: { type: Object, required: true, default: {} },
});
</script>
<template>
  <div class="w-full">
    <h3
      class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white pb-5"
    >
      {{ $t("Content Toc") }}
    </h3>
    <ul class="text-[1rem]">
      <li v-for="link of body.toc.links" :key="link.id">
        <a :href="`#${link.id}`">{{ link.text }}</a>
        <ul>
          <li v-for="link1 of link.children" :key="link1.id">
            <a :href="`#${link1.id}`">{{ link1.text }}</a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
