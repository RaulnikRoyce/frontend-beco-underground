<template>
  <section class="panel-card p-10 text-center">
    <p class="text-lg font-semibold">{{ titulo }}</p>
    <p v-if="texto" class="mt-2 text-sm text-zinc-400">{{ texto }}</p>
    <slot />
  </section>
</template>

<script>
export default {
  props: {
    titulo: { type: String, required: true },
    texto: { type: String, default: '' },
  },
};
</script>
