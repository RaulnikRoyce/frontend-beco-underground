<template>
  <div>
    <div
      v-if="toastItens.length"
      class="fixed right-4 top-4 z-[300] flex w-full max-w-sm flex-col gap-2 print:hidden"
    >
      <div
        v-for="item in toastItens"
        :key="item.id"
        class="rounded-xl border px-4 py-3 text-sm backdrop-blur"
        :class="classeToast(item.tipo)"
      >
        {{ item.mensagem }}
      </div>
    </div>

    <div
      v-if="painel.carregando"
      class="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden"
      role="status"
      aria-live="polite"
      aria-label="Carregando"
    >
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-red-500"></div>
    </div>

    <RouterView />
  </div>
</template>

<script>
import { storeToRefs } from 'pinia';
import { usePainelStore } from './stores/painel';
import { useToastStore } from './stores/toast';

export default {
  setup() {
    const painel = usePainelStore();
    const toast = useToastStore();
    const { itens: toastItens } = storeToRefs(toast);

    function classeToast(tipo) {
      const map = {
        success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-100',
        error: 'border-red-500/30 bg-red-950/80 text-red-100',
        info: 'border-zinc-700 bg-zinc-900/90 text-zinc-100',
      };
      return map[tipo] || map.info;
    }

    return { painel, toastItens, classeToast };
  },
};
</script>
