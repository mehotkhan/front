<script setup lang="ts">
defineProps({
  body: { type: Object, required: true, default: {} },
  comments: { type: Boolean, required: false, default: false },
});
</script>
<template>
  <div class="w-full prose md:prose-lg">
    <h3 class="mt-0">
      {{ $t("Content Toc") }}
    </h3>
    <ol class="md:-mb-4">
      <li v-for="link of body.toc.links" :key="link.id">
        <a :href="`#${link.id}`">{{ link.text }}</a>
        <ul>
          <li v-for="link1 of link.children" :key="link1.id">
            <a :href="`#${link1.id}`">{{ link1.text }}</a>
          </li>
        </ul>
      </li>
      <li v-if="comments" key="comments">
        <a :href="`#comments`">{{ $t("Comments") }}</a>
      </li>
    </ol>
  </div>
</template>
