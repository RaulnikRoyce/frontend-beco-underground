<template>
  <AppLayout>
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold">{{ auth.saudacao }}, {{ auth.primeiroNome }}</h1>
        <p class="mt-1 text-sm text-zinc-400">
          {{ painel.eventos.length ? `Você tem ${proximos.length} evento${proximos.length === 1 ? '' : 's'} na frente.` : 'Nenhum evento cadastrado ainda. Que tal criar o primeiro?' }}
        </p>
      </div>
      <RouterLink to="/eventos" class="btn-primary no-underline">Criar evento</RouterLink>
    </div>

    <section class="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <p class="text-3xl font-bold">{{ stat.valor }}</p>
        <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">{{ stat.label }}</p>
      </div>
    </section>

    <div class="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <div class="space-y-6">
        <article v-if="proximo" class="panel-card cursor-pointer overflow-hidden" @click="$router.push(`/eventos/${proximo.id}`)">
          <div class="bg-gradient-to-r from-red-700/40 to-transparent p-6">
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">{{ statusEvento(proximo.data).label }}</p>
            <h2 class="mt-2 text-2xl font-bold">{{ proximo.nome }}</h2>
            <p class="mt-2 text-sm text-zinc-300">{{ formatarData(proximo.data) }} · {{ proximo.local }}</p>
            <p class="mt-3 font-mono text-sm text-emerald-400">R$ {{ formatarMoeda(painel.custoDoEvento(proximo.id)) }}</p>
          </div>
        </article>

        <section v-if="painel.eventos.length" class="panel-card p-6">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-semibold">Eventos recentes</h3>
            <RouterLink to="/eventos" class="text-xs font-semibold text-red-400 no-underline hover:text-red-300">Ver todos →</RouterLink>
          </div>
          <ul class="space-y-3">
            <li
              v-for="evento in painel.eventos.slice(0, 4)"
              :key="evento.id"
              class="lineup-row flex cursor-pointer items-center justify-between rounded-xl px-4 py-3"
              @click="$router.push(`/eventos/${evento.id}`)"
            >
              <div>
                <p class="font-semibold">{{ evento.nome }}</p>
                <p class="text-xs text-zinc-500">{{ formatarData(evento.data) }} · {{ evento.local }}</p>
              </div>
              <span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase" :class="badge(evento)">
                {{ statusEvento(evento.data).label }}
              </span>
            </li>
          </ul>
        </section>

        <EmptyState
          v-else
          titulo="Nenhum evento criado ainda"
          texto="Monte o primeiro cronograma e comece a escalar artistas."
        >
          <RouterLink to="/eventos" class="btn-primary mt-6 inline-flex no-underline">Criar primeiro evento</RouterLink>
        </EmptyState>
      </div>

      <aside class="panel-card p-6">
        <h3 class="mb-4 font-semibold capitalize">{{ mesNome }}</h3>
        <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500">
          <span v-for="dia in ['D','S','T','Q','Q','S','S']" :key="dia">{{ dia }}</span>
        </div>
        <div class="mt-2 grid grid-cols-7 gap-1">
          <button
            v-for="(cel, i) in calendario"
            :key="i"
            type="button"
            class="aspect-square rounded-lg text-xs"
            :class="celulaClasse(cel)"
            :disabled="!cel"
          >
            {{ cel || '' }}
          </button>
        </div>
        <div class="mt-4 flex gap-4 text-[10px] text-zinc-500">
          <span class="flex items-center gap-1.5"><i class="h-2 w-2 rounded-full bg-red-500"></i> Evento</span>
          <span class="flex items-center gap-1.5"><i class="h-2 w-2 rounded-full bg-zinc-600"></i> Hoje</span>
        </div>
      </aside>
    </div>
  </AppLayout>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { usePainelStore } from '../stores/painel';
import AppLayout from '../components/AppLayout.vue';
import EmptyState from '../components/EmptyState.vue';
import { formatarData, formatarMoeda, statusEvento } from '../lib/formatar';

export default {
  components: { AppLayout, EmptyState },
  setup() {
    const auth = useAuthStore();
    const painel = usePainelStore();

    onMounted(() => {
      if (!painel.eventos.length) painel.carregarTudo();
    });

    const proximos = computed(() =>
      painel.eventos
        .filter((evento) => statusEvento(evento.data).chave !== 'done')
        .slice()
        .sort((a, b) => String(a.data).localeCompare(String(b.data)))
    );

    const proximo = computed(() => proximos.value[0] || null);

    const stats = computed(() => [
      { label: 'Eventos', valor: painel.eventos.length },
      { label: 'Artistas', valor: painel.bandas.length },
      { label: 'Próximos', valor: proximos.value.length },
      { label: 'Cachê total', valor: `R$ ${formatarMoeda(painel.custoTotalGeral)}` },
    ]);

    const agora = new Date();
    const mesNome = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const firstDay = new Date(agora.getFullYear(), agora.getMonth(), 1).getDay();
    const daysInMonth = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();
    const eventDays = computed(() => {
      const map = {};
      painel.eventos.forEach((evento) => {
        const ymd = String(evento.data).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (ymd && Number(ymd[1]) === agora.getFullYear() && Number(ymd[2]) === agora.getMonth() + 1) {
          map[Number(ymd[3])] = true;
        }
      });
      return map;
    });

    const calendario = [];
    for (let i = 0; i < firstDay; i += 1) calendario.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) calendario.push(d);

    function celulaClasse(dia) {
      if (!dia) return 'opacity-0';
      const hoje = dia === agora.getDate();
      const temEvento = eventDays.value[dia];
      if (temEvento) return 'bg-red-600 font-semibold text-white';
      if (hoje) return 'border border-white/20 text-white';
      return 'text-zinc-400 hover:bg-white/5';
    }

    function badge(evento) {
      const chave = statusEvento(evento.data).chave;
      if (chave === 'live') return 'bg-red-500/15 text-red-300';
      if (chave === 'done') return 'bg-zinc-700/40 text-zinc-400';
      return 'bg-white/5 text-zinc-300';
    }

    return { auth, painel, proximos, proximo, stats, mesNome, calendario, formatarData, formatarMoeda, statusEvento, celulaClasse, badge };
  },
};
</script>
