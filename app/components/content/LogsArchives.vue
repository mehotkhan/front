<script setup lang="ts">
const route = useRoute();

const props = defineProps({
  cat: { type: String, required: false, default: "" },
});

const { data } = await useAsyncData(`logs-archives-${route.path}`, () => {
  try {
    const contentPath = route.path === "/" ? `/fa` : route.path;

    let logsQuery = queryCollection("logs");

    if (props.cat) {
      logsQuery = logsQuery.where("cat", "=", props.cat);
    }

    logsQuery = logsQuery
      .andWhere((query) => query.where("path", "LIKE", `${contentPath}%`))
      .limit(20)
      .order("date", "DESC");

    return logsQuery.all();
  } catch (error) {
    console.error("Error fetching page content:", error);
  }
});
</script>

<template>
  <div class="w-full">
    <h2 class="mt-0">
      {{ cat ? $t("Latest ") + $t(cat) : $t("Latest Incoming") }}
    </h2>

    <div v-if="data" class="px-5 md:m-0">
      <ol>
        <li v-for="item in data" :key="item.id" class="mb-2">
          <div class="md:inline-flex">
            <NuxtLink :to="item.path" class="hover:!underline">
              {{ item.title }}
            </NuxtLink>
            <span class="font-thin block">
              / {{ formatDateTime(item.date) }}
            </span>
            <NuxtLink
              v-if="item.cat"
              :to="`/${locale}/cats/${item.cat}`"
              class="hover:!underline transition-colors duration-300 font-thin"
            >
              /
              {{ $t(item.cat) ?? item.cat }}
            </NuxtLink>
          </div>
        </li>
      </ol>
    </div>
    <p v-else>{{ $t("Noting is Here :(") }}</p>
  </div>
</template>
