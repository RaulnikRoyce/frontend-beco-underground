<template>
  <AppLayout>
    <div class="mb-6">
      <h1 class="text-3xl font-extrabold">Artistas</h1>
      <p class="mt-1 text-sm text-zinc-400">Catálogo de bandas e cachê base para o palco.</p>
    </div>

    <section v-if="auth.isAdmin" class="panel-card mb-6 p-6">
      <h2 class="section-title">{{ editando ? 'Editar artista' : 'Novo artista' }}</h2>
      <form class="mt-4 grid max-w-2xl gap-4" @submit.prevent="salvar">
        <label class="grid gap-1 text-sm">
          <span class="text-zinc-400">Nome</span>
          <input id="artista-nome" v-model="form.nome" class="field" placeholder="Nome da banda / artista" required />
        </label>
        <label class="grid gap-1 text-sm">
          <span class="text-zinc-400">Gênero</span>
          <input id="artista-genero" v-model="form.genero" class="field" placeholder="Gênero" />
        </label>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="grid gap-1 text-sm">
            <span class="text-zinc-400">Cachê base (R$)</span>
            <input v-model="form.cache_base" type="number" min="0" step="0.01" class="field" required />
          </label>
          <label class="grid gap-1 text-sm">
            <span class="text-zinc-400">Contato</span>
            <input v-model="form.contato" class="field" placeholder="WhatsApp, e-mail…" />
          </label>
        </div>
        <label class="grid gap-1 text-sm">
          <span class="text-zinc-400">Descrição</span>
          <textarea v-model="form.descricao" class="field min-h-24 resize-y" placeholder="Estilo, formação, observações…" maxlength="2000" />
        </label>
        <div class="flex flex-wrap gap-2">
          <button type="submit" class="btn-primary">{{ editando ? 'Salvar alterações' : 'Cadastrar artista' }}</button>
          <button v-if="editando" type="button" class="btn-ghost" @click="cancelarEdicao">Cancelar</button>
        </div>
      </form>
    </section>

    <div class="grid gap-4 md:grid-cols-2">
      <article v-for="banda in painel.bandas" :key="banda.id" class="panel-card relative p-6">
        <div class="absolute right-4 top-4 flex gap-2">
          <button
            v-if="auth.isAdmin"
            class="btn-ghost text-xs"
            type="button"
            @click="iniciarEdicao(banda)"
          >
            Editar
          </button>
          <button
            v-if="auth.isAdmin"
            class="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/60"
            type="button"
            @click="excluir(banda.id)"
          >
            Excluir
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2 pr-28">
          <h3 class="text-xl font-bold">{{ banda.nome }}</h3>
          <span v-if="banda.genero" class="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {{ banda.genero }}
          </span>
        </div>
        <p v-if="banda.descricao" class="mt-3 text-sm text-zinc-400">{{ banda.descricao }}</p>
        <p v-if="banda.contato" class="mt-2 text-sm text-zinc-500">{{ banda.contato }}</p>
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
import { reactive, ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { usePainelStore } from '../stores/painel';
import AppLayout from '../components/AppLayout.vue';
import EmptyState from '../components/EmptyState.vue';
import { formatarMoeda } from '../lib/formatar';

const formVazio = () => ({ nome: '', genero: '', contato: '', descricao: '', cache_base: '' });

export default {
  components: { AppLayout, EmptyState },
  setup() {
    const auth = useAuthStore();
    const painel = usePainelStore();
    const form = reactive(formVazio());
    const editando = ref(null);

    onMounted(() => {
      if (!painel.bandas.length) painel.carregarTudo();
    });

    function limparForm() {
      Object.assign(form, formVazio());
      editando.value = null;
    }

    function iniciarEdicao(banda) {
      editando.value = banda.id;
      form.nome = banda.nome;
      form.genero = banda.genero || '';
      form.contato = banda.contato || '';
      form.descricao = banda.descricao || '';
      form.cache_base = banda.cache_base;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function cancelarEdicao() {
      limparForm();
    }

    async function salvar() {
      if (editando.value) {
        await painel.atualizarBanda(editando.value, { ...form });
      } else {
        await painel.criarBanda({ ...form });
      }
      limparForm();
    }

    function excluir(id) {
      if (!confirm('Excluir este artista?')) return;
      painel.excluirBanda(id);
      if (editando.value === id) limparForm();
    }

    return {
      auth, painel, form, editando, salvar, excluir, iniciarEdicao, cancelarEdicao, formatarMoeda,
    };
  },
};
</script>
