<template>
  <div class="flex h-full flex-col">
    <div class="px-5 pb-3 pt-5">
      <RouterLink to="/" class="flex items-center gap-2.5 no-underline" @click="$emit('navegar')">
        <span class="grid h-9 w-9 place-items-center rounded-xl bg-red-600 text-sm font-extrabold text-white">B</span>
        <span class="text-[19px] font-extrabold marca-beco">
          Beco <span class="text-red-500">Underground</span>
        </span>
      </RouterLink>
    </div>

    <div class="px-5 pb-4">
      <span class="inline-block rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[10px] font-bold tracking-wide text-red-300">
        {{ auth.perfilLabel }}
      </span>
    </div>

    <nav class="flex flex-col gap-0.5 px-2.5" aria-label="Principal">
      <p class="px-3 pb-1 pt-2 text-[9px] font-bold tracking-[0.2em] text-zinc-600">MENU</p>
      <RouterLink
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        class="nav-link relative flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium no-underline transition"
        :class="{ 'bg-red-500/10 !text-red-500': ativo(item.to) }"
        @click="$emit('navegar')"
      >
        <span class="w-4">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
        <span v-if="ativo(item.to)" class="ml-auto h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#dc2626]"></span>
      </RouterLink>
    </nav>

    <div class="mt-auto border-t border-white/5 p-2.5">
      <div class="mb-1.5 flex items-center gap-2.5 rounded-[10px] border border-white/5 bg-white/[0.03] px-3 py-2.5">
        <span class="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-zinc-700 to-red-600 text-[11px] font-bold">
          {{ auth.iniciais }}
        </span>
        <div class="min-w-0">
          <p class="truncate text-xs font-semibold">{{ auth.primeiroNome }}</p>
          <p class="text-[10px] font-bold text-red-400">{{ auth.perfilLabel }}</p>
        </div>
      </div>
      <TrocarSenha />
      <button
        type="button"
        class="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
        @click="$emit('sair')"
      >
        Sair da conta
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import TrocarSenha from './TrocarSenha.vue';

export default {
  components: { TrocarSenha },
  emits: ['sair', 'navegar'],
  setup() {
    const route = useRoute();
    const auth = useAuthStore();
    const menu = computed(() => {
      const itens = [
        { to: '/', label: 'Início', icon: '◆' },
        { to: '/eventos', label: 'Eventos', icon: '▣' },
        { to: '/artistas', label: 'Artistas', icon: '♪' },
      ];
      if (auth.isAdmin) itens.push({ to: '/equipe', label: 'Equipe', icon: '◉' });
      return itens;
    });

    function ativo(path) {
      if (path === '/') return route.path === '/';
      return route.path.startsWith(path);
    }

    return { auth, menu, ativo };
  },
};
</script>
