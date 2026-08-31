<template>
  <section class="panel-card p-6 print:hidden">
    <div v-if="carregando" class="text-sm text-zinc-500">Carregando ingressos…</div>

    <template v-else-if="resumo">
      <div class="mb-6 grid gap-4 md:grid-cols-2">
        <div class="rounded-xl border border-zinc-800 p-4">
          <h3 class="section-title mb-3">Meta</h3>
          <div class="grid gap-2 text-sm">
            <label v-if="admin" class="grid gap-1">
              <span class="text-zinc-400">Slug da loja</span>
              <input v-model="formMeta.slug" class="field" @change="salvarMeta" />
            </label>
            <p v-else><span class="text-zinc-400">Slug</span> {{ resumo.config.slug || 'n/d' }}</p>

            <label v-if="admin" class="grid gap-1">
              <span class="text-zinc-400">Público esperado</span>
              <input v-model.number="formMeta.publico_esperado" type="number" min="1" class="field" @change="salvarMeta" />
            </label>
            <p v-else><span class="text-zinc-400">Público esperado</span> {{ resumo.config.publico_esperado || 'n/d' }}</p>

            <label v-if="admin" class="grid gap-1">
              <span class="text-zinc-400">Capacidade máxima</span>
              <input v-model.number="formMeta.capacidade_maxima" type="number" min="1" class="field" @change="salvarMeta" />
            </label>
            <p v-else><span class="text-zinc-400">Capacidade</span> {{ resumo.config.capacidade_maxima || 'n/d' }}</p>

            <label v-if="admin" class="grid gap-1">
              <span class="text-zinc-400">Margem %</span>
              <input v-model.number="formMeta.margem_percentual" type="number" min="0" step="0.1" class="field" @change="salvarMeta" />
            </label>
            <p v-else><span class="text-zinc-400">Margem</span> {{ resumo.config.margem_percentual ?? 'n/d' }}%</p>
          </div>
        </div>

        <div class="rounded-xl border border-zinc-800 p-4">
          <h3 class="section-title mb-3">Calculadora</h3>
          <dl class="grid gap-1 text-sm">
            <div class="flex justify-between"><dt class="text-zinc-400">Cachê lineup</dt><dd class="font-mono">R$ {{ formatarMoeda(resumo.precificacao.custo_caches) }}</dd></div>
            <div class="flex justify-between"><dt class="text-zinc-400">Produção</dt><dd class="font-mono">R$ {{ formatarMoeda(resumo.precificacao.custo_producao) }}</dd></div>
            <div class="flex justify-between font-semibold"><dt>Total</dt><dd class="font-mono text-red-400">R$ {{ formatarMoeda(resumo.precificacao.custo_total) }}</dd></div>
            <div class="flex justify-between"><dt class="text-zinc-400">Preço sugerido</dt><dd class="font-mono">R$ {{ formatarMoeda(resumo.precificacao.preco_sugerido) }}</dd></div>
            <div class="flex justify-between"><dt class="text-zinc-400">Break-even</dt><dd>{{ resumo.precificacao.break_even ?? 'n/d' }} ingressos</dd></div>
          </dl>

          <div v-if="admin" class="mt-4 grid gap-2 sm:grid-cols-2">
            <label class="grid gap-1 text-sm">
              <span class="text-zinc-400">Simular % vendido</span>
              <input v-model.number="simulador.percentual" type="number" min="1" max="100" class="field" @change="atualizarSimulador" />
            </label>
            <label class="grid gap-1 text-sm">
              <span class="text-zinc-400">Preço simulado (R$)</span>
              <input v-model.number="simulador.preco" type="number" min="0" step="0.01" class="field" @change="atualizarSimulador" />
            </label>
          </div>
          <p v-if="precificacaoSimulada" class="mt-2 text-xs text-zinc-400">
            {{ precificacaoSimulada.simulador.ingressos_vendidos }} vendidos a R$ {{ formatarMoeda(precificacaoSimulada.simulador.preco_unitario) }}
            → receita R$ {{ formatarMoeda(precificacaoSimulada.simulador.receita) }},
            sobra R$ {{ formatarMoeda(precificacaoSimulada.simulador.sobra) }}
          </p>
        </div>
      </div>

      <div class="mb-6 rounded-xl border border-zinc-800 p-4">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="section-title">Custos de produção</h3>
          <span class="font-mono text-xs text-red-400">R$ {{ formatarMoeda(resumo.precificacao.custo_producao) }}</span>
        </div>

        <ul class="space-y-2 text-sm">
          <li v-for="custo in resumo.custos" :key="custo.id" class="lineup-row flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3">
            <span>{{ custo.descricao }} <span v-if="custo.categoria" class="text-zinc-500">({{ custo.categoria }})</span></span>
            <span class="flex items-center gap-2">
              <span class="font-mono text-red-400">R$ {{ formatarMoeda(custo.valor) }}</span>
              <button v-if="admin" type="button" class="btn-ghost text-red-400" @click="removerCusto(custo)">Remover</button>
            </span>
          </li>
          <li v-if="!resumo.custos.length" class="text-center text-zinc-500">Nenhum custo cadastrado.</li>
        </ul>

        <form v-if="admin" class="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]" @submit.prevent="adicionarCusto">
          <input v-model="formCusto.descricao" class="field" placeholder="Descrição (som, local…)" required />
          <input v-model="formCusto.categoria" class="field" placeholder="Categoria" />
          <input v-model.number="formCusto.valor" type="number" min="0.01" step="0.01" class="field" placeholder="Valor" required />
          <button type="submit" class="btn-primary">Add</button>
        </form>
      </div>

      <div class="mb-6 rounded-xl border border-zinc-800 p-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 class="section-title">Lotes</h3>
          <button
            v-if="admin && resumo.precificacao.preco_sugerido"
            type="button"
            class="btn-ghost text-xs"
            @click="aplicarSugestao"
          >
            Aplicar sugestão no lote
          </button>
        </div>

        <ul class="space-y-2 text-sm">
          <li v-for="lote in resumo.lotes" :key="lote.id" class="lineup-row rounded-xl px-4 py-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong>{{ lote.nome }}</strong>
                · R$ {{ formatarMoeda(lote.preco) }}
                · {{ lote.quantidade_total }} un.
                · restam {{ lote.restam }}
              </span>
              <button v-if="admin" type="button" class="btn-ghost text-red-400" @click="removerLote(lote)">Remover</button>
            </div>
          </li>
          <li v-if="!resumo.lotes.length" class="text-center text-zinc-500">Nenhum lote cadastrado.</li>
        </ul>

        <form v-if="admin" class="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]" @submit.prevent="adicionarLote">
          <input v-model="formLote.nome" class="field" placeholder="Nome do lote" required />
          <input v-model.number="formLote.preco" type="number" min="0.01" step="0.01" class="field" placeholder="Preço" required />
          <input v-model.number="formLote.quantidade_total" type="number" min="1" class="field" placeholder="Qtd" required />
          <button type="submit" class="btn-primary">Add lote</button>
        </form>
      </div>

      <div class="rounded-xl border border-zinc-800 p-4">
        <h3 class="section-title mb-3">Publicação</h3>

        <div v-if="admin" class="mb-4 grid gap-3 sm:grid-cols-2">
          <label class="grid gap-1 text-sm">
            <span class="text-zinc-400">Taxa MP estimada (%)</span>
            <input v-model.number="formMeta.taxa_mp_percentual" type="number" min="0" step="0.01" class="field" @change="salvarMeta" />
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="formMeta.repassa_taxa_comprador" type="checkbox" :true-value="1" :false-value="0" @change="salvarMeta" />
            Repassar taxa ao comprador
          </label>
        </div>

        <p class="mb-3 text-sm">
          Status:
          <span :class="resumo.config.venda_publicada ? 'text-green-400' : 'text-zinc-400'">
            {{ resumo.config.venda_publicada ? 'Publicado' : 'Rascunho' }}
          </span>
          · vendidos {{ resumo.vendidos }} · receita R$ {{ formatarMoeda(resumo.receita) }}
        </p>

        <div class="flex flex-wrap gap-2">
          <button v-if="admin" type="button" class="btn-primary" @click="alternarPublicacao">
            {{ resumo.config.venda_publicada ? 'Despublicar' : 'Publicar venda' }}
          </button>
          <button type="button" class="btn-ghost" @click="copiarLink">Copiar link da loja</button>
          <button v-if="admin" type="button" class="btn-ghost" @click="abrirPreview">Abrir preview</button>
        </div>

        <p class="mt-3 break-all text-xs text-zinc-500">{{ linkLoja }}</p>
      </div>
    </template>

    <p v-else-if="erro" class="text-sm text-red-400">{{ erro }}</p>
  </section>
</template>

<script>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { LOJA_INGRESSOS_URL } from '../config';
import { formatarMoeda } from '../lib/formatar';
import { useToastStore } from '../stores/toast';
import {
  obterResumoIngressos,
  obterPrecificacao,
  atualizarConfigIngressos,
  publicarVenda,
  criarCusto,
  excluirCusto,
  criarLote,
  excluirLote,
  atualizarLote,
} from '../services/ingressos';

export default {
  props: {
    eventoId: { type: [Number, String], required: true },
    admin: { type: Boolean, default: false },
  },
  setup(props) {
    const toast = useToastStore();
    const carregando = ref(true);
    const erro = ref('');
    const resumo = ref(null);
    const precificacaoSimulada = ref(null);

    const formMeta = reactive({
      slug: '',
      publico_esperado: null,
      capacidade_maxima: null,
      margem_percentual: 15,
      taxa_mp_percentual: 4.99,
      repassa_taxa_comprador: 0,
    });

    const formCusto = reactive({ descricao: '', categoria: '', valor: null });
    const formLote = reactive({ nome: '1º lote', preco: null, quantidade_total: null });

    const simulador = reactive({
      percentual: 80,
      preco: null,
    });

    const linkLoja = computed(() => {
      const slug = resumo.value?.config?.slug;
      const base = LOJA_INGRESSOS_URL.replace(/\/$/, '');
      if (slug) return `${base}/${slug}`;
      return `${base}/e/${props.eventoId}`;
    });

    function preencherMeta(config) {
      formMeta.slug = config.slug || '';
      formMeta.publico_esperado = config.publico_esperado;
      formMeta.capacidade_maxima = config.capacidade_maxima;
      formMeta.margem_percentual = config.margem_percentual ?? 15;
      formMeta.taxa_mp_percentual = config.taxa_mp_percentual ?? 4.99;
      formMeta.repassa_taxa_comprador = Number(config.repassa_taxa_comprador) || 0;
      simulador.preco = resumo.value?.precificacao?.preco_sugerido || null;
    }

    async function carregar() {
      carregando.value = true;
      erro.value = '';
      try {
        resumo.value = await obterResumoIngressos(props.eventoId);
        preencherMeta(resumo.value.config);
        await atualizarSimulador();
      } catch (err) {
        erro.value = err.response?.data?.erro || 'Não foi possível carregar ingressos.';
      } finally {
        carregando.value = false;
      }
    }

    async function atualizarSimulador() {
      try {
        precificacaoSimulada.value = await obterPrecificacao(props.eventoId, {
          percentual_vendido: simulador.percentual,
          preco_simulado: simulador.preco,
        });
      } catch {
        precificacaoSimulada.value = null;
      }
    }

    async function salvarMeta() {
      if (!props.admin) return;
      try {
        const atualizado = await atualizarConfigIngressos(props.eventoId, { ...formMeta });
        resumo.value.config = atualizado;
        resumo.value.precificacao = await obterPrecificacao(props.eventoId);
        toast.mostrar('Meta salva.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao salvar meta.', 'error');
        await carregar();
      }
    }

    async function adicionarCusto() {
      try {
        await criarCusto(props.eventoId, {
          descricao: formCusto.descricao,
          categoria: formCusto.categoria || null,
          valor: formCusto.valor,
        });
        formCusto.descricao = '';
        formCusto.categoria = '';
        formCusto.valor = null;
        await carregar();
        toast.mostrar('Custo adicionado.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao adicionar custo.', 'error');
      }
    }

    async function removerCusto(custo) {
      if (!confirm(`Remover "${custo.descricao}"?`)) return;
      try {
        await excluirCusto(props.eventoId, custo.id);
        await carregar();
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao remover custo.', 'error');
      }
    }

    async function adicionarLote() {
      try {
        await criarLote(props.eventoId, { ...formLote, ordem: resumo.value.lotes.length });
        formLote.nome = `${resumo.value.lotes.length + 2}º lote`;
        formLote.preco = resumo.value.precificacao.preco_sugerido;
        formLote.quantidade_total = null;
        await carregar();
        toast.mostrar('Lote criado.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao criar lote.', 'error');
      }
    }

    async function removerLote(lote) {
      if (!confirm(`Remover lote "${lote.nome}"?`)) return;
      try {
        await excluirLote(props.eventoId, lote.id);
        await carregar();
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao remover lote.', 'error');
      }
    }

    async function aplicarSugestao() {
      const sugestao = resumo.value.precificacao.preco_sugerido;
      if (!sugestao) return;
      formLote.preco = sugestao;
      if (!resumo.value.lotes.length) {
        formLote.quantidade_total = formMeta.publico_esperado || 100;
        toast.mostrar(`Sugestão R$ ${formatarMoeda(sugestao)} no formulário de lote.`, 'info');
        return;
      }
      const primeiro = resumo.value.lotes[0];
      try {
        await atualizarLote(props.eventoId, primeiro.id, { preco: sugestao });
        await carregar();
        toast.mostrar('Preço sugerido aplicado no primeiro lote.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao aplicar sugestão.', 'error');
      }
    }

    async function alternarPublicacao() {
      try {
        const publicado = !resumo.value.config.venda_publicada;
        const config = await publicarVenda(props.eventoId, publicado);
        resumo.value.config = config;
        toast.mostrar(publicado ? 'Venda publicada.' : 'Venda em rascunho.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao publicar.', 'error');
      }
    }

    async function copiarLink() {
      try {
        await navigator.clipboard.writeText(linkLoja.value);
        toast.mostrar('Link da loja copiado.', 'success');
      } catch {
        toast.mostrar(linkLoja.value, 'info');
      }
    }

    function abrirPreview() {
      const url = `${linkLoja.value}?preview=1`;
      window.open(url, '_blank', 'noopener');
    }

    watch(() => props.eventoId, carregar);
    onMounted(carregar);

    return {
      carregando,
      erro,
      resumo,
      formMeta,
      formCusto,
      formLote,
      simulador,
      precificacaoSimulada,
      linkLoja,
      formatarMoeda,
      salvarMeta,
      adicionarCusto,
      removerCusto,
      adicionarLote,
      removerLote,
      aplicarSugestao,
      alternarPublicacao,
      copiarLink,
      abrirPreview,
      atualizarSimulador,
    };
  },
};
</script>
