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
          <button v-if="podeEditar" class="btn-ghost" type="button" @click="alternarEdicao">
            {{ editando ? 'Cancelar' : 'Editar' }}
          </button>
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

      <form
        v-if="editando"
        class="panel-card mb-6 grid gap-3 p-6 md:grid-cols-[1fr_auto_1fr_auto] print:hidden"
        @submit.prevent="salvarEvento"
      >
        <label class="sr-only" for="editar-nome">Nome do evento</label>
        <input id="editar-nome" v-model="formEvento.nome" class="field" placeholder="Nome do evento" required />
        <label class="sr-only" for="editar-data">Data</label>
        <input id="editar-data" v-model="formEvento.data" type="date" class="field" required />
        <label class="sr-only" for="editar-local">Local</label>
        <input id="editar-local" v-model="formEvento.local" class="field" placeholder="Local" required />
        <button type="submit" class="btn-primary">Salvar</button>
      </form>

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
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <input
                  v-if="auth.isAdmin"
                  :value="horarioInput(item.horario)"
                  type="time"
                  class="field w-auto min-w-[7.5rem] py-2"
                  :aria-label="`Horário de ${item.nome}`"
                  @change="salvarHorario(item, $event)"
                />
                <strong v-else class="font-mono">{{ formatarHorario(item.horario) }}</strong>
                <span class="opacity-40">·</span>
                {{ item.nome }}
              </span>
              <span class="flex items-center gap-2">
                <span class="font-mono text-xs text-red-500">R$ {{ formatarMoeda(item.cache) }}</span>
                <button
                  v-if="auth.isAdmin"
                  class="btn-ghost text-red-400"
                  type="button"
                  @click="tirarDaLineup(item)"
                >
                  Tirar
                </button>
              </span>
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
                v-for="banda in bandasDisponiveis"
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
import { computed, onMounted, reactive, ref } from 'vue';
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
    const editando = ref(false);
    const formEvento = reactive({ nome: '', data: '', local: '' });
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

    const podeEditar = computed(() => podeExcluir.value);

    const bandasDisponiveis = computed(() => {
      const noPalco = new Set(lineup.value.map((item) => Number(item.banda_id)));
      return painel.bandas.filter((banda) => !noPalco.has(Number(banda.id)));
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

    function horarioInput(horario) {
      return formatarHorario(horario) === '--:--' ? '' : formatarHorario(horario);
    }

    function alternarEdicao() {
      if (editando.value) {
        editando.value = false;
        return;
      }
      formEvento.nome = evento.value.nome;
      formEvento.data = evento.value.data;
      formEvento.local = evento.value.local;
      editando.value = true;
    }

    async function salvarEvento() {
      await painel.atualizarEvento(evento.value.id, {
        nome: formEvento.nome,
        data: formEvento.data,
        local: formEvento.local,
      });
      editando.value = false;
    }

    function salvarHorario(item, event) {
      painel.atualizarSlot(item.lineup_id, { horario: event.target.value || null }, evento.value.id);
    }

    function tirarDaLineup(item) {
      if (!confirm(`Tirar ${item.nome} desta noite? O evento continua.`)) return;
      painel.removerDoLineup(item.lineup_id, evento.value.id);
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
      editando,
      formEvento,
      artistaEscolhido,
      bandasDisponiveis,
      podeExcluir,
      podeEditar,
      formatarData,
      formatarMoeda,
      formatarHorario,
      horarioInput,
      imprimir,
      alternarEdicao,
      salvarEvento,
      salvarHorario,
      tirarDaLineup,
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

