<script setup lang="ts">
// Reference to the comments list component
const commentsListRef = ref<InstanceType<typeof CommentsLists> | null>(null);

// Handle the event emitted from CommentsCreateForm and trigger refresh in CommentsLists.
const handleCommentPosted = () => {
  commentsListRef.value?.refreshComments();
};
</script>

<template>
  <section id="comments" class="w-full">
    <div class="flex justify-between items-center my-5">
      <h2 class="text-3xl font-semibold">{{ $t("Comments") }}</h2>
    </div>
    <!-- Emit "commentPosted" event from the create form -->
    <CommentsCreateForm @comment-posted="handleCommentPosted" />
    <!-- Bind ref to allow refresh from parent -->
    <ClientOnly>
      <CommentsLists ref="commentsListRef" />
    </ClientOnly>
  </section>
</template>
