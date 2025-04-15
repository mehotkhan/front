<script lang="ts" setup>
const { locale, t } = useI18n();

const route = useRoute();

// Fetch content with useAsyncData
const { data: pageData, error } = await useAsyncData(
  `page:${route.path}`,
  () => {
    try {
      const contentPath = route.path === "/" ? `/fa` : route.path;
      return queryCollection("content").path(contentPath).first();
    } catch (err) {
      console.error(`Error fetching content for ${route.path}:`, err);
      throw err;
    }
  }
);

// Set SEO metadata
useSeoMeta({
  title: pageData?.value?.title ?? t("Page not found"),
  description: pageData?.value?.description ?? t("Page not found"),
  ogTitle: pageData?.value?.title ?? t("Page not found"),
  ogDescription: pageData?.value?.description ?? t("Page not found"),
  ogImage: pageData?.value?.thumbnail ?? "/icons/android-chrome-512x512.png",
});
</script>
<template>
  <div class="w-full min-h-screen">
    <div v-if="pageData" class="w-full">
      <template v-if="pageData?.thumbnail">
        <div
          class="page-header flex flex-col gap-6 text-center pt-10 md:pb-12 md:min-h-[calc(100vh-2rem)] items-center justify-between text-gray-600 border-gray-200 bg-gray-100"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              {{ pageData?.title }}
            </h1>
            <div class="flex flex-wrap justify-center gap-6 text-sm mb-4">
              <span
                v-if="pageData?.author"
                class="font-medium whitespace-nowrap"
              >
                {{ $t("Author:") }}
                <span class="normal-case">{{ pageData?.author }}</span>
              </span>
              <span
                v-if="locale && pageData?.cat"
                class="font-medium whitespace-nowrap"
              >
                {{ $t("Category:") }}
                <NuxtLink
                  :to="`/${locale}/cats/${pageData?.cat}`"
                  class="hover:!underline transition-colors duration-300"
                >
                  {{ $t(pageData?.cat) ?? pageData?.cat }}
                </NuxtLink>
              </span>
              <span v-if="pageData?.date" class="font-medium whitespace-nowrap">
                {{ $t("Date:") }}
                <span class="normal-case">{{
                  formatDateTime(pageData?.date)
                }}</span>
              </span>
            </div>
            <p class="mt-5 text-lg">
              {{ pageData?.description }}
            </p>
          </div>
          <div class="max-w-7xl mx-auto mt-6">
            <nuxt-img
              v-if="pageData?.thumbnail"
              provider="cloudflare"
              preload
              loading="lazy"
              :placeholder="[400]"
              sizes="(max-width: 768px) 100vw, 1280px"
              class="md:h-[calc(100vh-24rem)] w-full md:max-w-7xl md:rounded-sm h-auto"
              :src="pageData?.thumbnail"
              :alt="pageData?.title"
            />
          </div>
        </div>
      </template>

      <UContainer>
        <div
          class="max-w-2xl mx-auto flex flex-col items-center py-10 px-2 sm:px-4 prose md:prose-lg dark:prose-invert"
        >
          <PageToc
            v-if="pageData?.toc"
            :body="pageData?.body"
            :comments="pageData?.comments"
          />
          <ContentRenderer :value="pageData" class="w-full" />
          <Comments v-if="pageData?.comments" />
        </div>
      </UContainer>
    </div>
  </div>
</template>
