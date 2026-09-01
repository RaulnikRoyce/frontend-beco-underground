<template>
  <AppLayout>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold">Eventos</h1>
        <p class="mt-1 text-sm text-zinc-400">Crie, abra o cronograma e acompanhe o custo de cada noite.</p>
      </div>
    </div>

    <section class="panel-card mb-6 p-6">
      <h2 class="section-title">Novo evento</h2>
      <form class="form-grid form-grid-2 mt-4" @submit.prevent="criar">
        <label class="sr-only" for="evento-nome">Nome do evento</label>
        <input id="evento-nome" v-model="form.nome" class="field" placeholder="Nome do evento" required />
        <label class="sr-only" for="evento-data">Data</label>
        <input id="evento-data" v-model="form.data" type="date" class="field" required />
        <label class="sr-only" for="evento-local">Local</label>
        <input id="evento-local" v-model="form.local" class="field sm:col-span-2" placeholder="Local" required />
        <button type="submit" class="btn-primary sm:col-span-2">Cadastrar</button>
      </form>
    </section>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="evento in painel.eventosFiltrados"
        :key="evento.id"
        class="panel-card cursor-pointer p-6 transition hover:border-red-500/30"
        @click="$router.push(`/eventos/${evento.id}`)"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase" :class="badge(evento)">
              {{ statusEvento(evento.data).label }}
            </span>
            <h3 class="mt-3 text-xl font-bold">{{ evento.nome }}</h3>
            <p class="mt-1 text-sm text-zinc-400">{{ formatarData(evento.data) }} · {{ evento.local }}</p>
          </div>
          <p class="font-mono text-sm text-emerald-400">R$ {{ formatarMoeda(painel.custoDoEvento(evento.id)) }}</p>
        </div>
        <p class="mt-4 text-xs text-zinc-500">{{ (painel.lineups[evento.id] || []).length }} artista(s) no lineup</p>
      </article>
    </div>

    <EmptyState
      v-if="!painel.eventosFiltrados.length"
      class="mt-4"
      titulo="Nenhum evento encontrado"
      texto="Cadastre o primeiro ou ajuste a busca no topo."
    />
  </AppLayout>
</template>

<script>
import { reactive, onMounted } from 'vue';
import { usePainelStore } from '../stores/painel';
import AppLayout from '../components/AppLayout.vue';
import EmptyState from '../components/EmptyState.vue';
import { formatarData, formatarMoeda, statusEvento } from '../lib/formatar';

export default {
  components: { AppLayout, EmptyState },
  setup() {
    const painel = usePainelStore();
    const form = reactive({ nome: '', data: '', local: '' });

    onMounted(() => {
      if (!painel.eventos.length) painel.carregarTudo();
    });

    async function criar() {
      await painel.criarEvento({ ...form });
      form.nome = '';
      form.data = '';
      form.local = '';
    }

    function badge(evento) {
      const chave = statusEvento(evento.data).chave;
      if (chave === 'live') return 'bg-red-500/15 text-red-300';
      if (chave === 'done') return 'bg-zinc-700/40 text-zinc-400';
      return 'bg-white/5 text-zinc-300';
    }

    return { painel, form, criar, formatarData, formatarMoeda, statusEvento, badge };
  },
};
</script>
