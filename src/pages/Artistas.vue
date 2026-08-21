<template>
  <AppLayout>
    <div class="mb-6">
      <h1 class="text-3xl font-extrabold">Artistas</h1>
      <p class="mt-1 text-sm text-zinc-400">Catálogo de bandas e cachê base para o palco.</p>
    </div>

    <section v-if="auth.isAdmin" class="panel-card mb-6 p-6">
      <h2 class="section-title">Novo artista</h2>
      <form class="mt-4 grid gap-3" @submit.prevent="criar">
        <label class="sr-only" for="artista-nome">Nome do artista</label>
        <input id="artista-nome" v-model="form.nome" class="field" placeholder="Nome da banda / artista" required />
        <label class="sr-only" for="artista-genero">Gênero</label>
        <input id="artista-genero" v-model="form.genero" class="field" placeholder="Gênero" />
        <div class="grid gap-3 sm:grid-cols-2">
          <input v-model="form.cache_base" type="number" min="0" step="0.01" class="field" placeholder="Cachê base (R$)" required />
          <input v-model="form.contato" class="field" placeholder="Contato" />
        </div>
        <button type="submit" class="btn-primary w-full sm:w-auto">Cadastrar artista</button>
      </form>
    </section>

    <div class="grid gap-4 md:grid-cols-2">
      <article v-for="banda in painel.bandas" :key="banda.id" class="panel-card relative p-6">
        <button
          v-if="auth.isAdmin"
          class="absolute right-4 top-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 hover:text-red-400"
          type="button"
          @click="excluir(banda.id)"
        >
          Excluir
        </button>
        <div class="flex flex-wrap items-center gap-2 pr-16">
          <h3 class="text-xl font-bold">{{ banda.nome }}</h3>
          <span v-if="banda.genero" class="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {{ banda.genero }}
          </span>
        </div>
        <p v-if="banda.contato" class="mt-3 text-sm text-zinc-400">{{ banda.contato }}</p>
        <p class="mt-2 font-mono text-sm font-semibold text-emerald-400">R$ {{ formatarMoeda(banda.cache_base) }}</p>
      </article>
    </div>

    <EmptyState
      v-if="!painel.bandas.length"
      class="mt-4"
      titulo="Nenhum artista cadastrado"
      texto="Cadastre o catálogo para montar a lineup dos eventos."
    />
  </AppLayout>
</template>

<script>
import { reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { usePainelStore } from '../stores/painel';
import AppLayout from '../components/AppLayout.vue';
import EmptyState from '../components/EmptyState.vue';
import { formatarMoeda } from '../lib/formatar';

export default {
  components: { AppLayout, EmptyState },
  setup() {
    const auth = useAuthStore();
    const painel = usePainelStore();
    const form = reactive({ nome: '', genero: '', contato: '', cache_base: '' });

    onMounted(() => {
      if (!painel.bandas.length) painel.carregarTudo();
    });

    async function criar() {
      await painel.criarBanda({ ...form });
      form.nome = '';
      form.genero = '';
      form.contato = '';
      form.cache_base = '';
    }

    function excluir(id) {
      if (!confirm('Excluir este artista?')) return;
      painel.excluirBanda(id);
    }

    return { auth, painel, form, criar, excluir, formatarMoeda };
  },
};
</script>
