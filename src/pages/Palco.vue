<template>
  <div class="palco-root">
    <div class="dots" aria-hidden="true"></div>
    <div class="orbs" aria-hidden="true"></div>

    <main class="palco-card">
      <img src="/logo-beco.png" alt="Beco Underground Produções" class="h-16 w-16 rounded-full object-cover" width="64" height="64" />
      <p class="mt-3 text-[10px] font-bold uppercase tracking-[0.25em] text-red-400">Beco Underground</p>

      <p v-if="carregando" class="mt-8 text-sm text-zinc-400">Carregando seu horário…</p>
      <p v-else-if="erro" class="mt-8 text-sm text-red-400" role="alert">{{ erro }}</p>

      <div v-else-if="pagina">
        <h1 class="mt-3 text-3xl font-extrabold">{{ pagina.evento.nome }}</h1>
        <p class="mt-2 text-sm text-zinc-400">
          {{ formatarData(pagina.evento.data) }} · {{ pagina.evento.local }}
        </p>

        <section class="mt-8 rounded-2xl border border-red-500/25 bg-red-500/10 p-5">
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">Você toca</p>
          <p class="mt-2 font-mono text-4xl font-extrabold text-white">{{ formatarHorario(pagina.voce.horario) }}</p>
          <p class="mt-2 text-lg font-semibold">{{ pagina.voce.nome }}</p>
          <p class="mt-3 font-mono text-sm text-emerald-400">Cachê combinado R$ {{ formatarMoeda(pagina.voce.cache) }}</p>
        </section>

        <section class="mt-8">
          <h2 class="section-title">No palco nesta noite</h2>
          <ul class="mt-3 space-y-2">
            <li
              v-for="item in lineup"
              :key="`${item.horario}-${item.nome}`"
              class="flex items-center justify-between rounded-xl border border-white/20 bg-zinc-900 px-4 py-3 text-sm text-zinc-100"
              :class="item.voce ? 'border-red-500 bg-red-950/60' : ''"
            >
              <span>
                <strong class="font-mono text-white">{{ formatarHorario(item.horario) }}</strong>
                <span class="mx-2 text-zinc-500">·</span>
                {{ item.nome }}
              </span>
              <span v-if="item.voce" class="text-[10px] font-bold uppercase tracking-wide text-red-300">Você</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { buscarPaginaBanda } from '../services/publico';
import { formatarData, formatarHorario, formatarMoeda, ordenarLineup } from '../lib/formatar';

export default {
  setup() {
    const route = useRoute();
    const pagina = ref(null);
    const carregando = ref(true);
    const erro = ref('');

    const lineup = computed(() => ordenarLineup(pagina.value?.lineup || []));

    onMounted(async () => {
      try {
        pagina.value = await buscarPaginaBanda(route.params.token);
      } catch {
        erro.value = 'Link inválido ou expirado. Peça o endereço de novo para a produção.';
      } finally {
        carregando.value = false;
      }
    });

    return { pagina, lineup, carregando, erro, formatarData, formatarHorario, formatarMoeda };
  },
};
</script>

<style scoped>
.palco-root {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #09090b;
  color: #fafafa;
}

.dots, .orbs {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.dots {
  background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 26px 26px;
}

.orbs {
  background:
    radial-gradient(ellipse 60% 50% at 8% 20%, rgba(220,38,38,0.16) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 90% 80%, rgba(255,255,255,0.04) 0%, transparent 55%);
}

.palco-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 32px;
  border-radius: 16px;
  background: rgba(12, 12, 14, 0.92);
  color: #fafafa;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(220, 38, 38, 0.28);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.palco-card :deep(.section-title) {
  color: #a1a1aa;
}
</style>
