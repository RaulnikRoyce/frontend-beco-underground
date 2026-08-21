<template>
  <AppLayout>
    <div v-if="evento">
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4 no-print">
        <div>
          <RouterLink to="/eventos" class="text-xs font-semibold text-zinc-500 no-underline hover:text-white">← Eventos</RouterLink>
          <h1 class="mt-2 text-3xl font-extrabold">{{ evento.nome }}</h1>
          <p class="mt-1 text-sm text-zinc-400">{{ formatarData(evento.data) }} · {{ evento.local }}</p>
        </div>
        <div class="flex gap-2">
          <button class="btn-ghost" type="button" @click="imprimir">Imprimir</button>
          <button
            v-if="podeExcluir"
            class="btn-ghost text-red-400 hover:border-red-500"
            type="button"
            @click="excluir"
          >
            Excluir
          </button>
        </div>
      </div>

      <div class="print:block">
        <h1 class="hidden print:mb-2 print:block print:text-3xl print:text-black">{{ evento.nome }}</h1>
        <p class="hidden print:mb-6 print:block print:font-bold print:text-black">
          {{ formatarData(evento.data) }} | {{ evento.local }}
        </p>
      </div>

      <section class="panel-card p-6 print:border-none print:bg-white print:p-0 print:shadow-none">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="section-title print:text-lg print:text-black">Lineup</h2>
          <span class="rounded-lg bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-400 print:hidden">
            R$ {{ formatarMoeda(painel.custoDoEvento(evento.id)) }}
          </span>
        </div>

        <ul class="space-y-2">
          <li
            v-for="item in lineup"
            :key="item.lineup_id"
            class="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-sm print:border-b print:border-gray-300 print:bg-white"
          >
            <span class="print:text-black">
              <strong class="font-mono text-zinc-300 print:text-black">{{ formatarHorario(item.horario) }}</strong>
              <span class="mx-2 text-zinc-600">·</span>
              {{ item.nome }}
            </span>
            <span class="font-mono text-xs text-emerald-400 print:hidden">R$ {{ formatarMoeda(item.cache) }}</span>
          </li>
          <li v-if="!lineup.length" class="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500 print:hidden">
            Nenhum artista escalado ainda.
          </li>
        </ul>

        <form
          v-if="auth.isAdmin"
          class="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto] print:hidden"
          @submit.prevent="escalar"
        >
          <label class="sr-only" for="escalar-artista">Artista</label>
          <select id="escalar-artista" v-model="evento.novaBandaId" class="field" required>
            <option value="" disabled>Selecionar artista</option>
            <option v-for="banda in painel.bandas" :key="banda.id" :value="banda.id">{{ banda.nome }}</option>
          </select>
          <label class="sr-only" for="escalar-horario">Horário</label>
          <input id="escalar-horario" v-model="evento.novoHorario" type="time" class="field" />
          <button type="submit" class="btn-primary">Add</button>
        </form>
      </section>
    </div>

    <p v-else-if="painel.carregando" class="text-sm text-zinc-500">Carregando evento…</p>
    <p v-else class="panel-card p-8 text-center text-sm text-zinc-500">Evento não encontrado.</p>
  </AppLayout>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePainelStore } from '../stores/painel';
import AppLayout from '../components/AppLayout.vue';
import { formatarData, formatarMoeda, formatarHorario } from '../lib/formatar';

export default {
  components: { AppLayout },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const auth = useAuthStore();
    const painel = usePainelStore();
    const imprimindo = ref(false);

    onMounted(async () => {
      if (!painel.eventos.length) await painel.carregarTudo();
    });

    const evento = computed(() =>
      painel.eventos.find((item) => String(item.id) === String(route.params.id))
    );

    const lineup = computed(() => painel.lineups[evento.value?.id] || []);

    const podeExcluir = computed(() => {
      if (!evento.value) return false;
      if (auth.isAdmin) return true;
      return Number(evento.value.criado_por) === Number(auth.usuarioId);
    });

    function imprimir() {
      imprimindo.value = true;
      setTimeout(() => {
        window.print();
        imprimindo.value = false;
      }, 150);
    }

    async function excluir() {
      if (!confirm('Excluir este evento?')) return;
      await painel.excluirEvento(evento.value.id);
      router.push('/eventos');
    }

    function escalar() {
      painel.adicionarAoLineup(evento.value);
    }

    return { auth, painel, evento, lineup, podeExcluir, imprimindo, formatarData, formatarMoeda, formatarHorario, imprimir, excluir, escalar };
  },
};
</script>
