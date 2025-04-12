<script lang="ts" setup>
const { defaultLocale } = useI18n();

const route = useRoute();
const { data: pageData }: any = useAsyncData(
  `page:${route.path}`,
  async () => {
    return await queryCollection("content")
      .path(route.path === "/" ? "/" + defaultLocale + "/" : route.path)
      .first();
  },
  {
    // Avoid lazy so SSR always fetches
    lazy: false,
    default: () => null,
    server: true,
  }
);

// Set dynamic page metadata (SEO)
useSeoMeta({
  title: pageData.value?.title,
  description: pageData.value?.description,
});
</script>

<template>
  <div class="w-full min-h-screen">
    <!-- If Content is Available -->
    <div v-if="pageData" class="w-full">
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

      <!-- Edit Button (If User Has Permission) -->
    </div>

    <div v-else class="flex items-center h-[calc(100vh-7rem)]">
      <UContainer
        class="flex flex-col items-center max-w-7xl mx-auto gap-6 text-center"
      >
        <UIcon name="i-lucide-search-x" class="text-yellow-500 size-40" />
        <h2 class="text-3xl font-semibold">{{ $t("404 - Page Not Found") }}</h2>
        <p class="text-lg">
          {{
            $t("The page you are looking for doesn’t exist or has been moved.")
          }}
        </p>
        <p class="text-lg">
          {{ $t("Please check the URL or return to the homepage.") }}
        </p>
        <RouterLink to="/" class="mt-4 text-blue-500 hover:underline">
          {{ $t("Return to Homepage") }}
        </RouterLink>
      </UContainer>
    </div>
  </div>
</template>
