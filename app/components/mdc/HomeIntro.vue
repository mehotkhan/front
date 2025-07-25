<script setup lang="ts">
const route = useRoute();
const { locale } = useI18n();

interface QueryResponse {
  data: Array<{
    title: string;
    thumbnail: string;
    description: string;
    path: string;
    date: string;
    cat: string;
    intro: boolean;
    comments: boolean;
    newsletter: boolean;
    toc: boolean;
    body: string;
    tocData: Array<{ id: string; text: string; depth: number }>;
  }>;
}

const { data } = useAsyncData(
  `home-intro-${route.path}`,
  async () => {
    try {
      const response = await $fetch<QueryResponse>("/api/content/query", {
        query: {
          intro: true,
          sortBy: "date",
          sortOrder: "DESC",
          limit: 1,
          locale: locale.value,
        },
      });
      // Response is { status: 200, data: [...] }
      return response?.data?.[0] || null;
    } catch (e) {
      console.error("Error fetching home intro:", e);
      return null;
    }
  },
  {
    dedupe: "defer",
    lazy: false,
    server: true,
  }
);
</script>

<template>
  <div class="container mx-auto">
    <div v-if="data" class="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8">
      <div class="w-full md:w-1/2 flex flex-col justify-end order-1 md:order-none">
        <h2
          class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold hover:underline transition-colors duration-300">
          <NuxtLink :to="data?.path">{{ data?.title }}</NuxtLink>
        </h2>
        <p class="mt-4 text-sm sm:text-base md:text-lg text-justify">
          {{ data?.description }}
        </p>
        <NuxtLink :to="data.path" class="mt-4 text-sm sm:text-base hover:underline transition-colors duration-300">
          {{ $t("more") }}...
        </NuxtLink>
      </div>
      <nuxt-img 
        :provider="isDev ? '' : 'cloudflare'" :modifiers="{ fit: 'contain' }" preload loading="lazy"
        class="w-full md:w-1/2 max-h-[40vh] h-auto object-contain md:rounded-lg order-2 md:order-none"
        :src="data.thumbnail" :alt="data.title || 'Image'" placeholder />
    </div>
    <div v-else>
      <div class="flex flex-col md:flex-row items-center gap-4 sm:gap-6 md:gap-8">
        <div class="w-full md:w-1/2 order-1 md:order-none">
          <USkeleton class="h-8 w-3/4 rounded-md" />
          <USkeleton class="mt-4 h-4 w-full rounded-md" />
          <USkeleton class="mt-2 h-4 w-1/2 rounded-md" />
        </div>
        <div class="w-full md:w-1/2 order-2 md:order-none">
          <USkeleton class="w-full h-48 sm:h-64 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
</template>
