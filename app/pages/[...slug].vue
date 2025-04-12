<script lang="ts" setup>
const { defaultLocale } = useI18n();

const route = useRoute();
const { data: pageData }: any = useAsyncData(`page:${route.path}`, async () => {
  return await queryCollection("content")
    .path(route.path === "/" ? "/" + defaultLocale + "/" : route.path)
    .first();
});

// Set dynamic page metadata (SEO)
useSeoMeta({
  title: pageData.value?.title,
  description: pageData.value?.description,
});
</script>

<template>
  <div class="w-full min-h-screen">
    <!-- If Content is Available -->
    <div class="w-full">
      <template v-if="pageData.thumbnail">
        <div
          class="page-header flex flex-col gap-6 text-center pt-10 pb-12 md:min-h-[calc(100vh-2rem)] items-center justify-between text-gray-600 border-gray-200 bg-gray-100"
        >
          <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
              {{ pageData.title }}
            </h1>
            <div class="flex flex-wrap justify-center gap-6 text-sm mb-4">
              <span
                v-if="pageData?.author"
                class="font-medium whitespace-nowrap"
              >
                {{ $t("Author:") }}
                <span class="normal-case">{{ pageData.author }}</span>
              </span>
              <span v-if="pageData?.cat" class="font-medium whitespace-nowrap">
                {{ $t("Category:") }}
                <NuxtLinkLocale
                  :to="`/cats/${pageData.cat}`"
                  class="hover:!underline transition-colors duration-300"
                >
                  {{ $t(pageData.cat) ?? pageData.cat }}
                </NuxtLinkLocale>
              </span>
              <span v-if="pageData?.date" class="font-medium whitespace-nowrap">
                {{ $t("Date:") }}
                <span class="normal-case">{{
                  formatDateTime(pageData.date)
                }}</span>
              </span>
            </div>
            <p class="mt-5 text-lg">
              {{ pageData.description }}
            </p>
          </div>
          <div class="max-w-7xl mx-auto mt-6">
            <nuxt-img
              v-if="pageData.thumbnail"
              provider="cloudflare"
              preload
              loading="lazy"
              :placeholder="[400]"
              sizes="(max-width: 768px) 100vw, 1280px"
              class="h-[calc(100vh-24rem)] w-full md:max-w-7xl md:rounded-sm"
              :src="pageData.thumbnail"
              :alt="pageData.title"
            />
          </div>
        </div>
      </template>

      <!-- Main Content -->
      <UContainer>
        <div
          class="max-w-2xl mx-auto flex flex-col items-center py-10 px-2 sm:px-4 prose md:prose-lg dark:prose-invert"
        >
          <PageToc
            v-if="pageData.toc"
            :body="pageData.body"
            :comments="pageData.comments"
          />
          <ContentRenderer :value="pageData" class="w-full" />
          <Comments v-if="pageData.comments" />
        </div>
      </UContainer>
    </div>
  </div>
</template>
