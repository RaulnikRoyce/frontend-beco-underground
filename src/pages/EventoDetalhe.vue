<template>
  <AppLayout>
    <div v-if="evento">
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4 no-print">
        <div>
          <RouterLink to="/eventos" class="text-xs font-semibold no-underline" style="color: var(--beco-muted)">← Eventos</RouterLink>
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

      <div class="cartaz hidden print:block">
        <p class="cartaz-marca">Beco Underground</p>
        <h1 class="cartaz-titulo">{{ evento.nome }}</h1>
        <p class="cartaz-meta">{{ formatarData(evento.data) }} · {{ evento.local }}</p>
        <ol class="cartaz-lista">
          <li v-for="item in lineup" :key="`print-${item.lineup_id}`">
            <span class="cartaz-hora">{{ formatarHorario(item.horario) }}</span>
            <span class="cartaz-nome">{{ item.nome }}</span>
          </li>
        </ol>
      </div>

      <section class="panel-card p-6 print:hidden">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="section-title">Lineup</h2>
          <span class="rounded-lg bg-red-500/10 px-3 py-1 font-mono text-xs text-red-400 print:hidden">
            R$ {{ formatarMoeda(painel.custoDoEvento(evento.id)) }}
          </span>
        </div>

        <ul class="space-y-2">
          <li
            v-for="item in lineup"
            :key="item.lineup_id"
            class="lineup-row rounded-xl px-4 py-3 text-sm"
          >
            <div class="flex items-center justify-between gap-3">
              <span>
                <strong class="font-mono">{{ formatarHorario(item.horario) }}</strong>
                <span class="mx-2 opacity-40">·</span>
                {{ item.nome }}
              </span>
              <span class="font-mono text-xs text-red-500">R$ {{ formatarMoeda(item.cache) }}</span>
            </div>
            <button
              v-if="item.token"
              class="btn-ghost mt-2 print:hidden"
              type="button"
              @click="copiarLink(item)"
            >
              Copiar link da banda
            </button>
          </li>
          <li v-if="!lineup.length" class="lineup-row rounded-xl border-dashed px-4 py-8 text-center text-sm opacity-70">
            Nenhum artista escalado ainda.
          </li>
        </ul>

        <form
          v-if="auth.isAdmin"
          class="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto] print:hidden"
          @submit.prevent="escalar"
        >
          <div class="artista-picker">
            <button
              id="escalar-artista"
              class="field text-left"
              type="button"
              :aria-expanded="listaAberta"
              aria-haspopup="listbox"
              @click="listaAberta = !listaAberta"
            >
              {{ artistaEscolhido || 'Selecionar artista' }}
            </button>
            <ul v-if="listaAberta" class="artista-lista" role="listbox">
              <li
                v-for="banda in painel.bandas"
                :key="banda.id"
                role="option"
                :aria-selected="String(evento.novaBandaId) === String(banda.id)"
                @click="escolherArtista(banda)"
              >
                {{ banda.nome }}
              </li>
            </ul>
          </div>
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
import { useToastStore } from '../stores/toast';
import { formatarData, formatarMoeda, formatarHorario, ordenarLineup } from '../lib/formatar';

export default {
  components: { AppLayout },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const auth = useAuthStore();
    const painel = usePainelStore();
    const toast = useToastStore();
    const listaAberta = ref(false);
    onMounted(async () => {
      if (!painel.eventos.length) await painel.carregarTudo();
    });

    const evento = computed(() =>
      painel.eventos.find((item) => String(item.id) === String(route.params.id))
    );

    const lineup = computed(() => ordenarLineup(painel.lineups[evento.value?.id] || []));

    const podeExcluir = computed(() => {
      if (!evento.value) return false;
      if (auth.isAdmin) return true;
      return Number(evento.value.criado_por) === Number(auth.usuarioId);
    });

    const artistaEscolhido = computed(() => {
      const id = evento.value?.novaBandaId;
      if (!id) return '';
      return painel.bandas.find((banda) => String(banda.id) === String(id))?.nome || '';
    });

    function escolherArtista(banda) {
      evento.value.novaBandaId = banda.id;
      listaAberta.value = false;
    }

    function imprimir() {
      window.print();
    }

    async function excluir() {
      if (!confirm('Excluir este evento?')) return;
      await painel.excluirEvento(evento.value.id);
      router.push('/eventos');
    }

    function escalar() {
      if (!evento.value.novaBandaId) {
        toast.mostrar('Selecione um artista.', 'error');
        listaAberta.value = true;
        return;
      }
      painel.adicionarAoLineup(evento.value);
    }

    async function copiarLink(item) {
      const url = `${window.location.origin}/p/${item.token}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.mostrar('Link copiado. Manda no WhatsApp da banda.', 'success');
      } catch {
        toast.mostrar(url, 'info');
      }
    }

    return {
      auth,
      painel,
      evento,
      lineup,
      listaAberta,
      artistaEscolhido,
      podeExcluir,
      formatarData,
      formatarMoeda,
      formatarHorario,
      imprimir,
      excluir,
      escalar,
      escolherArtista,
      copiarLink,
    };
  },
};
</script>

<style scoped>
.cartaz {
  max-width: 720px;
}

.cartaz-marca {
  font-size: 11pt;
  font-weight: 800;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: #b91c1c;
}

.cartaz-titulo {
  margin: 8px 0 0;
  font-size: 32pt;
  line-height: 1.1;
  font-weight: 800;
  color: #111;
  border-bottom: 6px solid #dc2626;
  padding-bottom: 12px;
}

.cartaz-meta {
  margin: 14px 0 28px;
  font-size: 13pt;
  font-weight: 700;
  color: #3f3f46;
}

.cartaz-lista {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cartaz-lista li {
  display: flex;
  align-items: baseline;
  gap: 20px;
  padding: 14px 0;
  border-bottom: 1px solid #e4e4e7;
}

.cartaz-hora {
  width: 90px;
  font-family: ui-monospace, monospace;
  font-size: 16pt;
  font-weight: 800;
  color: #b91c1c;
}

.cartaz-nome {
  font-size: 18pt;
  font-weight: 700;
  color: #111;
}

.artista-picker {
  position: relative;
}

.artista-lista {
  position: absolute;
  z-index: 20;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 12px;
  border: 1px solid var(--beco-line);
  background: var(--beco-card);
  color: var(--beco-fg);
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.artista-lista li {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--beco-row-text);
  background: var(--beco-row);
  margin-bottom: 4px;
}

.artista-lista li:last-child {
  margin-bottom: 0;
}

.artista-lista li:hover,
.artista-lista li[aria-selected='true'] {
  background: #dc2626;
  color: #fff;
}
</style>

