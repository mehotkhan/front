<script setup lang="ts">
const route = useRoute();

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);

// Fetch comments with useAsyncData
const {
  data: commentsData,
  refresh: refreshComments,
  error,
} = useAsyncData(
  `comments:${route.path}:${page.value}`,
  async () => {
    try {
      // Skip API call during prerendering if server isn't available
      if (import.meta.server && process.env.NODE_ENV === "prerender") {
        return { comments: [], total: 0 };
      }

      // Fetch comments with unwrapped refs
      const response = await $fetch("/api/comments/single", {
        query: {
          page: page.value, // Unwrap ref
          pageSize: pageSize.value, // Unwrap ref
          path: route.path,
        },
      });
      return response;
    } catch (err) {
      console.error("Error fetching comments:", err);
      // Return fallback data on error
      return { comments: [], total: 0 };
    }
  },
  {
    // Optimize for prerendering
    lazy: false,
    server: true,
    // Watch for changes in page and path
    watch: [page, () => route.path],
    // Transform data to ensure consistent shape
    transform: (data) => data || { comments: [], total: 0 },
  }
);

// Expose refreshComments for external use
defineExpose({ refreshComments });

// Computed property for comments
const currentComments = computed(() => commentsData.value?.comments || []);

// Update total when commentsData changes
watch(commentsData, () => {
  if (commentsData.value?.total !== undefined) {
    total.value = commentsData.value.total;
  }
});
</script>

<template>
  <div class="flex w-full flex-col mt-5">
    <UCard
      v-for="comment in currentComments"
      :key="comment.id"
      class="mb-10 w-full"
      variant="soft"
      :ui="{
        root: 'p-0 rounded-sm  ',
        body: ' border-none',
        header: 'border-none',
      }"
    >
      <template #header>
        <div class="w-full flex justify-between">
          <div class="flex items-center gap-2">
            <UAvatar
              icon="i-lucide-user"
              size="xl"
              placeholder
              provider="cloudflare"
              :modifiers="{ fit: 'contain' }"
              :src="comment.author.avatar"
              preload
              loading="lazy"
              class="tracking-wide"
            />

            <span class="text-lg font-medium">
              {{ comment.author.displayName }}
            </span>
          </div>
          <div class="flex gap-2 text-sm">
            <span>{{ comment.status }}</span>
          </div>
        </div>
      </template>

      <span class="text-base">
        {{ comment.body }}
      </span>

      <template #footer>
        <div class="flex justify-between items-center text-sm">
          <span>{{ formatTimeAgo(comment.createdAt) }}</span>
          <UButton
            variant="outline"
            color="gray"
            size="sm"
            :ui="{ rounded: 'rounded-md' }"
          >
            {{ $t("Reply") }}
          </UButton>
        </div>
      </template>
    </UCard>
    <UPagination
      v-if="total > pageSize"
      v-model:page="page"
      :total="total"
      :page-size="pageSize"
      class="justify-center w-full flex"
    />
  </div>
</template>
