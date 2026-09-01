<template>
  <section class="panel-card p-6 print:hidden">
    <div v-if="carregando && !resumo" class="text-sm text-zinc-500">Carregando ingressos…</div>

    <template v-else-if="resumo">
      <p v-if="atualizando" class="mb-3 text-xs text-zinc-500">Atualizando…</p>

      <div class="space-y-2">
        <!-- Meta + calculadora -->
        <div class="bandeja">
          <button type="button" class="bandeja-btn" :aria-expanded="secaoAberta === 'meta'" @click="abrirSecao('meta')">
            <span>
              <span class="section-title">Meta e calculadora</span>
              <span class="ml-2 text-xs font-normal normal-case tracking-normal text-zinc-500">
                Público · margem · break-even
              </span>
            </span>
            <span class="bandeja-seta" aria-hidden="true">{{ secaoAberta === 'meta' ? '▾' : '▸' }}</span>
          </button>
          <div v-show="secaoAberta === 'meta'" class="bandeja-corpo">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="min-w-0">
                <p class="mb-3 text-xs text-zinc-500">Salve a meta antes de gerar os lotes.</p>

                <div v-if="admin" class="form-grid form-grid-2 text-sm">
                  <label class="grid gap-1 sm:col-span-2">
                    <span class="text-zinc-400">Slug da loja</span>
                    <input v-model="formMeta.slug" class="field" />
                  </label>
                  <label class="grid gap-1">
                    <span class="text-zinc-400">Público esperado</span>
                    <input v-model.number="formMeta.publico_esperado" type="number" min="1" class="field" />
                  </label>
                  <label class="grid gap-1">
                    <span class="text-zinc-400">Capacidade máxima</span>
                    <input v-model.number="formMeta.capacidade_maxima" type="number" min="1" class="field" />
                  </label>
                  <label class="grid gap-1">
                    <span class="text-zinc-400">Margem %</span>
                    <input v-model.number="formMeta.margem_percentual" type="number" min="0" step="0.1" class="field" />
                  </label>
                  <div class="flex items-end sm:col-span-2">
                    <button type="button" class="btn-primary w-full" :disabled="salvandoMeta" @click="salvarMeta()">
                      {{ salvandoMeta ? 'Salvando…' : 'Salvar meta' }}
                    </button>
                  </div>
                </div>
                <div v-else class="grid gap-2 text-sm">
                  <p><span class="text-zinc-400">Slug</span> {{ resumo.config.slug || 'n/d' }}</p>
                  <p><span class="text-zinc-400">Público esperado</span> {{ resumo.config.publico_esperado || 'n/d' }}</p>
                  <p><span class="text-zinc-400">Capacidade</span> {{ resumo.config.capacidade_maxima || 'n/d' }}</p>
                  <p><span class="text-zinc-400">Margem</span> {{ resumo.config.margem_percentual ?? 'n/d' }}%</p>
                </div>
              </div>

              <div class="min-w-0">
                <dl class="grid gap-2 text-sm">
                  <div class="flex justify-between"><dt class="text-zinc-400">Cachê lineup</dt><dd class="font-mono">R$ {{ formatarMoeda(resumo.precificacao.custo_caches) }}</dd></div>
                  <div class="flex justify-between"><dt class="text-zinc-400">Produção</dt><dd class="font-mono">R$ {{ formatarMoeda(resumo.precificacao.custo_producao) }}</dd></div>
                  <div class="flex justify-between font-semibold"><dt>Custo total</dt><dd class="font-mono text-red-400">R$ {{ formatarMoeda(resumo.precificacao.custo_total) }}</dd></div>
                  <div class="flex justify-between border-t border-zinc-800 pt-2 font-semibold text-emerald-400">
                    <dt>Meta de receita</dt>
                    <dd class="font-mono">R$ {{ formatarMoeda(resumo.precificacao.meta_receita) }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-zinc-400">Preço médio de referência</dt>
                    <dd class="font-mono">R$ {{ formatarMoeda(resumo.precificacao.preco_medio_referencia || resumo.precificacao.preco_sugerido) }}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-zinc-400">Break-even (lote ativo)</dt>
                    <dd>{{ resumo.precificacao.break_even ?? 'n/d' }} ingressos</dd>
                  </div>
                </dl>

                <div v-if="admin" class="form-grid form-grid-2 mt-4">
                  <label class="grid gap-1 text-sm">
                    <span class="text-zinc-400">Simular % vendido</span>
                    <input v-model.number="simulador.percentual" type="number" min="1" max="100" class="field" @change="atualizarSimulador" />
                  </label>
                  <label class="grid gap-1 text-sm">
                    <span class="text-zinc-400">Preço simulado (R$)</span>
                    <input v-model.number="simulador.preco" type="number" min="0" step="0.01" class="field" @change="atualizarSimulador" />
                  </label>
                </div>

                <div v-if="precificacaoSimulada?.simulador" class="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm">
                  <p class="font-medium">Simulação com {{ precificacaoSimulada.simulador.percentual_vendido }}% do público</p>
                  <dl class="mt-2 grid gap-1 text-sm">
                    <div class="flex justify-between"><dt class="text-zinc-400">Ingressos vendidos</dt><dd>{{ precificacaoSimulada.simulador.ingressos_vendidos }}</dd></div>
                    <div class="flex justify-between"><dt class="text-zinc-400">Receita simulada</dt><dd class="font-mono">R$ {{ formatarMoeda(precificacaoSimulada.simulador.receita) }}</dd></div>
                    <div class="flex justify-between"><dt class="text-zinc-400">Meta de receita</dt><dd class="font-mono">R$ {{ formatarMoeda(precificacaoSimulada.simulador.meta_receita) }}</dd></div>
                    <div class="flex justify-between"><dt class="text-zinc-400">Break-even neste preço</dt><dd>{{ precificacaoSimulada.simulador.break_even ?? 'n/d' }} ingressos</dd></div>
                    <div class="flex justify-between font-semibold" :class="precificacaoSimulada.simulador.cobre_custo ? 'text-emerald-400' : 'text-red-400'">
                      <dt>{{ precificacaoSimulada.simulador.cobre_custo ? 'Sobra' : 'Falta para cobrir custo' }}</dt>
                      <dd class="font-mono">R$ {{ formatarMoeda(Math.abs(precificacaoSimulada.simulador.sobra)) }}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Custos -->
        <div class="bandeja">
          <button type="button" class="bandeja-btn" :aria-expanded="secaoAberta === 'custos'" @click="abrirSecao('custos')">
            <span>
              <span class="section-title">Custos de produção</span>
              <span class="ml-2 font-mono text-xs font-normal normal-case tracking-normal text-red-400">
                R$ {{ formatarMoeda(resumo.precificacao.custo_producao) }}
              </span>
            </span>
            <span class="bandeja-seta" aria-hidden="true">{{ secaoAberta === 'custos' ? '▾' : '▸' }}</span>
          </button>
          <div v-show="secaoAberta === 'custos'" class="bandeja-corpo">
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
            <form v-if="admin" class="form-grid form-grid-2 mt-4" @submit.prevent="adicionarCusto">
              <input v-model="formCusto.descricao" class="field sm:col-span-2" placeholder="Descrição (som, local…)" required />
              <input v-model="formCusto.categoria" class="field" placeholder="Categoria" />
              <input v-model.number="formCusto.valor" type="number" min="0.01" step="0.01" class="field" placeholder="Valor" required />
              <button type="submit" class="btn-primary sm:col-span-2">Adicionar custo</button>
            </form>
          </div>
        </div>

        <!-- Lotes -->
        <div class="bandeja">
          <button type="button" class="bandeja-btn" :aria-expanded="secaoAberta === 'lotes'" @click="abrirSecao('lotes')">
            <span>
              <span class="section-title">Lotes</span>
              <span class="ml-2 text-xs font-normal normal-case tracking-normal text-zinc-500">
                {{ resumo.lotes.length }} cadastrado(s)
              </span>
            </span>
            <span class="bandeja-seta" aria-hidden="true">{{ secaoAberta === 'lotes' ? '▾' : '▸' }}</span>
          </button>
          <div v-show="secaoAberta === 'lotes'" class="bandeja-corpo">
            <p class="mb-3 text-xs text-zinc-500">
              Antecipado 30%, 1º 40%, 2º 25% e Porta 5%, com preço crescente. Virada por estoque e/ou data.
            </p>
            <div v-if="admin" class="mb-3 flex flex-wrap gap-2">
              <button
                v-if="!resumo.lotes.length"
                type="button"
                class="btn-primary text-xs"
                @click="gerarLotesSugeridosClick"
              >
                Gerar lotes sugeridos
              </button>
              <button
                v-if="resumo.precificacao.preco_medio_referencia || resumo.precificacao.preco_sugerido"
                type="button"
                class="btn-ghost text-xs"
                @click="aplicarSugestao"
              >
                Aplicar preço médio no 1º lote
              </button>
            </div>

            <p v-if="!resumo.lotes.length && !resumo.precificacao.lotes_sugeridos?.length" class="mb-3 text-xs text-amber-400/90">
              Defina público esperado mínimo 30 (e custos/margem) para ver a sugestão.
            </p>

            <ul v-if="resumo.precificacao.lotes_sugeridos?.length && !resumo.lotes.length" class="mb-4 space-y-1 rounded-lg border border-dashed border-zinc-700 p-3 text-xs text-zinc-400">
              <li v-for="(s, i) in resumo.precificacao.lotes_sugeridos" :key="i">
                {{ s.nome }} · R$ {{ formatarMoeda(s.preco) }} · {{ s.quantidade_total }} un. · receita ~ R$ {{ formatarMoeda(s.receita_estimada) }}
              </li>
            </ul>

            <ul class="space-y-3 text-sm">
              <li v-for="lote in lotesEdit" :key="lote.id" class="lineup-row rounded-xl p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="min-w-0 break-words">
                    <strong>{{ lote.nome_salvo }}</strong>
                    <span v-if="lote.vigente" class="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">Vigente</span>
                    · R$ {{ formatarMoeda(lote.preco_salvo) }}
                    · {{ lote.quantidade_salva }} un.
                    · restam {{ lote.restam }}
                  </span>
                  <button v-if="admin" type="button" class="btn-ghost text-red-400" @click="removerLote(lote)">Remover</button>
                </div>

                <div v-if="admin" class="form-grid form-grid-2 mt-3">
                  <label class="grid gap-1 text-xs text-zinc-500 sm:col-span-2">
                    Nome
                    <input v-model="lote.nome" class="field text-sm" />
                  </label>
                  <label class="grid gap-1 text-xs text-zinc-500">
                    Preço (R$)
                    <input v-model.number="lote.preco" type="number" min="0.01" step="0.01" class="field text-sm" />
                  </label>
                  <label class="grid gap-1 text-xs text-zinc-500">
                    Quantidade
                    <input v-model.number="lote.quantidade_total" type="number" min="1" class="field text-sm" />
                  </label>
                  <label class="grid gap-1 text-xs text-zinc-500">
                    Início da venda
                    <input v-model="lote.inicio_venda" type="datetime-local" class="field text-sm" />
                  </label>
                  <label class="grid gap-1 text-xs text-zinc-500">
                    Fim da venda
                    <input v-model="lote.fim_venda" type="datetime-local" class="field text-sm" />
                  </label>
                  <div class="flex items-end sm:col-span-2">
                    <button type="button" class="btn-primary w-full" :disabled="lote.salvando" @click="salvarLote(lote)">
                      {{ lote.salvando ? 'Salvando…' : 'Salvar lote' }}
                    </button>
                  </div>
                </div>
              </li>
              <li v-if="!lotesEdit.length" class="text-center text-zinc-500">Nenhum lote cadastrado.</li>
            </ul>

            <form v-if="admin" class="form-grid form-grid-2 mt-4" @submit.prevent="adicionarLote">
              <input v-model="formLote.nome" class="field sm:col-span-2" placeholder="Nome do lote" required />
              <input v-model.number="formLote.preco" type="number" min="0.01" step="0.01" class="field" placeholder="Preço" required />
              <input v-model.number="formLote.quantidade_total" type="number" min="1" class="field" placeholder="Quantidade" required />
              <label class="grid gap-1 text-xs text-zinc-500 sm:col-span-2">
                Início da venda (opcional)
                <input v-model="formLote.inicio_venda" type="datetime-local" class="field text-sm" />
              </label>
              <button type="submit" class="btn-primary sm:col-span-2">Adicionar lote</button>
            </form>
          </div>
        </div>

        <!-- Publicação -->
        <div class="bandeja">
          <button type="button" class="bandeja-btn" :aria-expanded="secaoAberta === 'publicacao'" @click="abrirSecao('publicacao')">
            <span>
              <span class="section-title">Publicação</span>
              <span
                class="ml-2 text-xs font-normal normal-case tracking-normal"
                :class="resumo.config.venda_publicada ? 'text-emerald-400' : 'text-zinc-500'"
              >
                {{ resumo.config.venda_publicada ? 'Publicado' : 'Rascunho' }}
              </span>
            </span>
            <span class="bandeja-seta" aria-hidden="true">{{ secaoAberta === 'publicacao' ? '▾' : '▸' }}</span>
          </button>
          <div v-show="secaoAberta === 'publicacao'" class="bandeja-corpo">
            <div v-if="admin" class="form-grid form-grid-2 mb-4">
              <label class="grid gap-1 text-sm">
                <span class="text-zinc-400">Taxa MP estimada (%)</span>
                <input v-model.number="formMeta.taxa_mp_percentual" type="number" min="0" step="0.01" class="field" />
              </label>
              <label class="flex items-center gap-2 text-sm sm:items-end sm:pb-3">
                <input v-model="formMeta.repassa_taxa_comprador" type="checkbox" :true-value="1" :false-value="0" />
                Repassar taxa ao comprador
              </label>
              <div class="flex items-end sm:col-span-2">
                <button type="button" class="btn-ghost w-full" :disabled="salvandoMeta" @click="salvarMeta()">
                  {{ salvandoMeta ? 'Salvando…' : 'Salvar taxas' }}
                </button>
              </div>
            </div>

            <p class="mb-3 text-sm">
              Vendidos {{ resumo.vendidos }} · entraram {{ resumo.entraram || 0 }}
              · receita R$ {{ formatarMoeda(resumo.receita) }}
              <span v-if="resumo.custo_coberto" class="ml-2 rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">Custo coberto</span>
            </p>

            <div class="flex flex-wrap gap-2">
              <button v-if="admin" type="button" class="btn-primary" @click="alternarPublicacao">
                {{ resumo.config.venda_publicada ? 'Despublicar' : 'Publicar venda' }}
              </button>
              <button type="button" class="btn-ghost" @click="copiarLink">Copiar link da loja</button>
              <button v-if="admin" type="button" class="btn-ghost" @click="abrirPreview">Abrir preview</button>
              <button v-if="admin" type="button" class="btn-ghost" @click="abrirListaPorta">Lista porta (PDF)</button>
              <button v-if="admin" type="button" class="btn-ghost" @click="baixarCsv">Export CSV</button>
            </div>
            <p class="mt-3 break-all text-xs text-zinc-500">{{ linkLoja }}</p>
          </div>
        </div>

        <!-- Cupons -->
        <div v-if="admin" class="bandeja">
          <button type="button" class="bandeja-btn" :aria-expanded="secaoAberta === 'cupons'" @click="abrirSecao('cupons')">
            <span class="section-title">Cupons</span>
            <span class="bandeja-seta" aria-hidden="true">{{ secaoAberta === 'cupons' ? '▾' : '▸' }}</span>
          </button>
          <div v-show="secaoAberta === 'cupons'" class="bandeja-corpo">
            <form class="form-grid form-grid-2" @submit.prevent="criarCupomForm">
              <input v-model="formCupom.codigo" class="field" placeholder="Código" required />
              <input v-model.number="formCupom.desconto_percentual" type="number" min="1" max="100" class="field" placeholder="Desconto %" required />
              <button type="submit" class="btn-primary sm:col-span-2">Criar cupom</button>
            </form>
          </div>
        </div>

        <!-- Cortesia -->
        <div v-if="admin" class="bandeja">
          <button type="button" class="bandeja-btn" :aria-expanded="secaoAberta === 'cortesia'" @click="abrirSecao('cortesia')">
            <span class="section-title">Cortesia</span>
            <span class="bandeja-seta" aria-hidden="true">{{ secaoAberta === 'cortesia' ? '▾' : '▸' }}</span>
          </button>
          <div v-show="secaoAberta === 'cortesia'" class="bandeja-corpo">
            <p class="mb-3 text-xs text-zinc-500">Emite ingresso pago sem Mercado Pago.</p>
            <form class="form-grid form-grid-2" @submit.prevent="emitirCortesiaForm">
              <input v-model="formCortesia.nome" class="field" placeholder="Nome" required />
              <input v-model="formCortesia.email" type="email" class="field" placeholder="E-mail" required />
              <select v-model="formCortesia.lote_id" class="field" required>
                <option value="">Lote</option>
                <option v-for="l in resumo.lotes" :key="l.id" :value="l.id">{{ l.nome }}</option>
              </select>
              <input v-model.number="formCortesia.quantidade" type="number" min="1" max="10" class="field" />
              <button type="submit" class="btn-primary sm:col-span-2">Emitir cortesia</button>
            </form>
            <div
              v-if="cortesiaEmitida"
              class="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-sm text-emerald-100"
              role="status"
            >
              <p>
                Cortesia emitida. Pedido
                <strong class="font-mono">{{ cortesiaEmitida.codigo_publico }}</strong>
                <button type="button" class="btn-ghost ml-2 text-xs" @click="copiarTexto(cortesiaEmitida.codigo_publico)">Copiar pedido</button>
              </p>
              <ul v-if="cortesiaEmitida.ingressos?.length" class="mt-2 space-y-1 font-mono text-xs">
                <li v-for="ing in cortesiaEmitida.ingressos" :key="ing.codigo">
                  Ingresso {{ ing.codigo }}
                  <button type="button" class="btn-ghost ml-1 text-xs" @click="copiarTexto(ing.codigo)">Copiar</button>
                  <a class="ml-2 text-emerald-300 underline" :href="`${baseLoja}/ingresso/${ing.codigo}`" target="_blank" rel="noopener">Abrir na loja</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Porta -->
        <div v-if="admin" class="bandeja">
          <button type="button" class="bandeja-btn" :aria-expanded="secaoAberta === 'porta'" @click="abrirSecao('porta')">
            <span class="section-title">Venda na porta</span>
            <span class="bandeja-seta" aria-hidden="true">{{ secaoAberta === 'porta' ? '▾' : '▸' }}</span>
          </button>
          <div v-show="secaoAberta === 'porta'" class="bandeja-corpo">
            <p class="mb-3 text-xs text-zinc-500">
              Pagamento presencial (dinheiro/PIX), QR na hora. Sem Mercado Pago.
            </p>
            <form class="form-grid form-grid-2" @submit.prevent="emitirPortaForm">
              <input v-model="formPorta.nome" class="field" placeholder="Nome" required />
              <input v-model="formPorta.email" type="email" class="field" placeholder="E-mail (opcional)" />
              <select v-model="formPorta.lote_id" class="field">
                <option value="">Lote vigente / automático</option>
                <option v-for="l in resumo.lotes" :key="l.id" :value="l.id">
                  {{ l.nome }}{{ l.vigente ? ' (vigente)' : '' }}
                </option>
              </select>
              <input v-model.number="formPorta.quantidade" type="number" min="1" max="10" class="field" />
              <button type="submit" class="btn-primary sm:col-span-2">Registrar venda na porta</button>
            </form>
            <div
              v-if="portaEmitida"
              class="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-sm text-emerald-100"
              role="status"
            >
              <p>
                Venda registrada. Pedido
                <strong class="font-mono">{{ portaEmitida.codigo_publico }}</strong>
                <button type="button" class="btn-ghost ml-2 text-xs" @click="copiarTexto(portaEmitida.codigo_publico)">Copiar</button>
                <a class="btn-ghost ml-2 text-xs" href="/checkin">Ir ao check-in</a>
              </p>
              <ul v-if="portaEmitida.ingressos?.length" class="mt-2 space-y-1 font-mono text-xs">
                <li v-for="ing in portaEmitida.ingressos" :key="ing.codigo">
                  Ingresso {{ ing.codigo }}
                  <button type="button" class="btn-ghost ml-1 text-xs" @click="copiarTexto(ing.codigo)">Copiar</button>
                  <a class="ml-2 text-emerald-300 underline" :href="`${baseLoja}/ingresso/${ing.codigo}`" target="_blank" rel="noopener">Abrir</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Compradores -->
        <div v-if="admin" class="bandeja">
          <button type="button" class="bandeja-btn" :aria-expanded="secaoAberta === 'compradores'" @click="abrirSecao('compradores')">
            <span>
              <span class="section-title">Compradores</span>
              <span class="ml-2 text-xs font-normal normal-case tracking-normal text-zinc-500">
                {{ compradores.length }} na lista
              </span>
            </span>
            <span class="bandeja-seta" aria-hidden="true">{{ secaoAberta === 'compradores' ? '▾' : '▸' }}</span>
          </button>
          <div v-show="secaoAberta === 'compradores'" class="bandeja-corpo">
            <p class="mb-4 text-xs text-zinc-500">Pedidos pagos, cortesias e pendentes.</p>
            <div class="form-grid form-grid-3 mb-4">
              <select v-model="filtrosCompradores.status" class="field text-sm" @change="carregarCompradores">
                <option value="">Todos status</option>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="expirado">Expirado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <select v-model="filtrosCompradores.canal" class="field text-sm" @change="carregarCompradores">
                <option value="">Todos canais</option>
                <option value="site">Site</option>
                <option value="cortesia">Cortesia</option>
                <option value="porta">Porta</option>
              </select>
              <select v-model="filtrosCompradores.lote_id" class="field text-sm" @change="carregarCompradores">
                <option value="">Todos lotes</option>
                <option v-for="l in resumo.lotes" :key="l.id" :value="l.id">{{ l.nome }}</option>
              </select>
            </div>

            <div class="max-h-80 overflow-auto rounded-xl border border-zinc-800">
              <table class="w-full min-w-[720px] text-left text-sm">
                <thead class="sticky top-0 bg-zinc-900/95 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th class="px-3 py-2">Pedido</th>
                    <th class="px-3 py-2">Nome</th>
                    <th class="px-3 py-2">E-mail</th>
                    <th class="px-3 py-2">Status</th>
                    <th class="px-3 py-2">Canal</th>
                    <th class="px-3 py-2">Lote</th>
                    <th class="px-3 py-2">Qtd</th>
                    <th class="px-3 py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in compradores" :key="`${c.codigo_publico}-${c.lote_nome}`" class="lineup-row border-t border-zinc-800/80">
                    <td class="px-3 py-2 font-mono text-xs text-zinc-400">{{ c.codigo_publico }}</td>
                    <td class="px-3 py-2">{{ c.nome }}</td>
                    <td class="px-3 py-2 text-zinc-400">{{ c.email }}</td>
                    <td class="px-3 py-2"><span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="badgeStatus(c.status)">{{ c.status }}</span></td>
                    <td class="px-3 py-2 capitalize text-zinc-400">{{ c.canal || 'site' }}</td>
                    <td class="px-3 py-2">{{ c.lote_nome }}</td>
                    <td class="px-3 py-2">{{ c.quantidade }}</td>
                    <td class="px-3 py-2">
                      <button type="button" class="btn-ghost text-xs" @click="copiarTexto(c.codigo_publico)">Copiar</button>
                      <a class="btn-ghost ml-1 text-xs" :href="`${baseLoja}/pedido/${c.codigo_publico}`" target="_blank" rel="noopener">Loja</a>
                      <button
                        v-if="c.status === 'pago' || c.status === 'pendente'"
                        type="button"
                        class="ml-1 rounded-lg border border-red-500/40 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-950/50"
                        @click="cancelarPedidoClick(c)"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!compradores.length">
                    <td colspan="8" class="px-3 py-6 text-center text-zinc-500">Nenhuma venda ainda.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </template>

    <p v-else-if="erro" class="text-sm text-red-400">{{ erro }}</p>
  </section>
</template>

<script>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
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
  emitirCortesia,
  listarCompradores,
  baixarCompradoresCsv,
  abrirListaPorta,
  criarCupom,
  gerarLotesSugeridos,
  cancelarPedido,
  emitirVendaPorta,
} from '../services/ingressos';

export default {
  props: {
    eventoId: { type: [Number, String], required: true },
    admin: { type: Boolean, default: false },
  },
  setup(props) {
    const toast = useToastStore();
    const carregando = ref(true);
    const atualizando = ref(false);
    const erro = ref('');
    const resumo = ref(null);
    const precificacaoSimulada = ref(null);
    const cortesiaEmitida = ref(null);
    const portaEmitida = ref(null);
    const lotesEdit = ref([]);
    const salvandoMeta = ref(false);
    const secaoAberta = ref('lotes');

    const formMeta = reactive({
      slug: '',
      publico_esperado: null,
      capacidade_maxima: null,
      margem_percentual: 15,
      taxa_mp_percentual: 4.99,
      repassa_taxa_comprador: 0,
    });

    const formCusto = reactive({ descricao: '', categoria: '', valor: null });
    const formLote = reactive({
      nome: '1º lote',
      preco: null,
      quantidade_total: null,
      inicio_venda: '',
    });
    const formCortesia = reactive({ nome: '', email: '', lote_id: '', quantidade: 1 });
    const formPorta = reactive({ nome: '', email: '', lote_id: '', quantidade: 1 });
    const formCupom = reactive({ codigo: '', desconto_percentual: 10 });
    const compradores = ref([]);
    const filtrosCompradores = reactive({ status: '', canal: '', lote_id: '' });

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

    const baseLoja = computed(() => LOJA_INGRESSOS_URL.replace(/\/$/, ''));

    function abrirSecao(id) {
      secaoAberta.value = secaoAberta.value === id ? '' : id;
    }

    function scrollDoPainel() {
      return document.querySelector('.content')?.scrollTop ?? 0;
    }

    function restaurarScroll(y) {
      const el = document.querySelector('.content');
      if (el != null) el.scrollTop = y;
    }

    function badgeStatus(status) {
      const map = {
        pago: 'bg-emerald-500/15 text-emerald-400',
        pendente: 'bg-amber-500/15 text-amber-400',
        expirado: 'bg-zinc-500/15 text-zinc-400',
        cancelado: 'bg-red-500/15 text-red-400',
      };
      return map[status] || 'bg-zinc-500/15 text-zinc-400';
    }

    function preencherMeta(config) {
      formMeta.slug = config.slug || '';
      formMeta.publico_esperado = config.publico_esperado;
      formMeta.capacidade_maxima = config.capacidade_maxima;
      formMeta.margem_percentual = config.margem_percentual ?? 15;
      formMeta.taxa_mp_percentual = config.taxa_mp_percentual ?? 4.99;
      formMeta.repassa_taxa_comprador = Number(config.repassa_taxa_comprador) || 0;
      simulador.preco = resumo.value?.precificacao?.preco_medio_referencia
        || resumo.value?.precificacao?.preco_sugerido
        || null;
    }

    async function carregarCompradores() {
      if (!props.admin) return;
      const params = {};
      if (filtrosCompradores.status) params.status = filtrosCompradores.status;
      if (filtrosCompradores.canal) params.canal = filtrosCompradores.canal;
      if (filtrosCompradores.lote_id) params.lote_id = filtrosCompradores.lote_id;
      compradores.value = await listarCompradores(props.eventoId, params);
    }

    function sincronizarLotesEdit() {
      lotesEdit.value = (resumo.value?.lotes || []).map((lote) => ({
        id: lote.id,
        nome: lote.nome,
        preco: Number(lote.preco),
        quantidade_total: Number(lote.quantidade_total),
        inicio_venda: paraDatetimeLocal(lote.inicio_venda),
        fim_venda: paraDatetimeLocal(lote.fim_venda),
        nome_salvo: lote.nome,
        preco_salvo: lote.preco,
        quantidade_salva: lote.quantidade_total,
        restam: lote.restam,
        vigente: lote.vigente,
        salvando: false,
      }));
    }

    async function carregar({ silencioso = false } = {}) {
      const y = scrollDoPainel();
      const jaTemDados = Boolean(resumo.value);
      if (silencioso && jaTemDados) atualizando.value = true;
      else carregando.value = true;
      erro.value = '';
      try {
        resumo.value = await obterResumoIngressos(props.eventoId);
        preencherMeta(resumo.value.config);
        sincronizarLotesEdit();
        if (props.admin) await carregarCompradores();
        await atualizarSimulador();
      } catch (err) {
        erro.value = err.response?.data?.erro || 'Não foi possível carregar ingressos.';
      } finally {
        carregando.value = false;
        atualizando.value = false;
        await nextTick();
        restaurarScroll(y);
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

    async function salvarMeta({ silencioso = false } = {}) {
      if (!props.admin) return false;
      salvandoMeta.value = true;
      try {
        const atualizado = await atualizarConfigIngressos(props.eventoId, { ...formMeta });
        resumo.value.config = atualizado;
        resumo.value.precificacao = await obterPrecificacao(props.eventoId);
        await atualizarSimulador();
        if (!silencioso) toast.mostrar('Meta salva.', 'success');
        return true;
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao salvar meta.', 'error');
        await carregar({ silencioso: true });
        return false;
      } finally {
        salvandoMeta.value = false;
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
        await carregar({ silencioso: true });
        toast.mostrar('Custo adicionado.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao adicionar custo.', 'error');
      }
    }

    async function removerCusto(custo) {
      if (!confirm(`Remover "${custo.descricao}"?`)) return;
      try {
        await excluirCusto(props.eventoId, custo.id);
        await carregar({ silencioso: true });
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao remover custo.', 'error');
      }
    }

    async function adicionarLote() {
      try {
        const payload = {
          nome: formLote.nome,
          preco: formLote.preco,
          quantidade_total: formLote.quantidade_total,
          ordem: resumo.value.lotes.length,
        };
        if (formLote.inicio_venda) {
          payload.inicio_venda = new Date(formLote.inicio_venda).toISOString();
        }
        await criarLote(props.eventoId, payload);
        formLote.nome = `${resumo.value.lotes.length + 2}º lote`;
        formLote.preco = resumo.value.precificacao.preco_medio_referencia || resumo.value.precificacao.preco_sugerido;
        formLote.quantidade_total = null;
        formLote.inicio_venda = '';
        await carregar({ silencioso: true });
        toast.mostrar('Lote criado.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao criar lote.', 'error');
      }
    }

    function paraDatetimeLocal(valor) {
      if (!valor) return '';
      const d = new Date(valor);
      if (Number.isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    function paraIso(valorLocal) {
      if (!valorLocal) return null;
      const d = new Date(valorLocal);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }

    async function salvarLote(lote) {
      if (!props.admin || lote.salvando) return;
      if (lote.inicio_venda && lote.fim_venda && lote.fim_venda <= lote.inicio_venda) {
        toast.mostrar('O fim da venda precisa ser depois do início.', 'error');
        return;
      }
      lote.salvando = true;
      try {
        await atualizarLote(props.eventoId, lote.id, {
          nome: lote.nome,
          preco: lote.preco,
          quantidade_total: lote.quantidade_total,
          inicio_venda: paraIso(lote.inicio_venda),
          fim_venda: paraIso(lote.fim_venda),
        });
        await carregar({ silencioso: true });
        toast.mostrar('Lote salvo.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao salvar lote.', 'error');
      } finally {
        lote.salvando = false;
      }
    }

    async function removerLote(lote) {
      if (!confirm(`Remover lote "${lote.nome_salvo || lote.nome}"?`)) return;
      try {
        await excluirLote(props.eventoId, lote.id);
        await carregar({ silencioso: true });
        toast.mostrar('Lote removido.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao remover lote.', 'error');
      }
    }

    async function gerarLotesSugeridosClick() {
      if (!confirm('Criar 4 lotes (Antecipado, 1º, 2º e Porta) com preços escalonados conforme a meta?')) return;
      const metaOk = await salvarMeta({ silencioso: true });
      if (!metaOk) return;
      try {
        await gerarLotesSugeridos(props.eventoId);
        await carregar({ silencioso: true });
        toast.mostrar('Lotes sugeridos criados.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao gerar lotes.', 'error');
      }
    }

    async function aplicarSugestao() {
      const sugestao = resumo.value.precificacao.preco_medio_referencia || resumo.value.precificacao.preco_sugerido;
      if (!sugestao) return;
      formLote.preco = sugestao;
      if (!resumo.value.lotes.length) {
        formLote.quantidade_total = formMeta.publico_esperado || 100;
        toast.mostrar(`Preço médio R$ ${formatarMoeda(sugestao)} no formulário de lote.`, 'info');
        return;
      }
      const primeiro = resumo.value.lotes[0];
      try {
        await atualizarLote(props.eventoId, primeiro.id, { preco: sugestao });
        await carregar({ silencioso: true });
        toast.mostrar('Preço médio aplicado no primeiro lote.', 'success');
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

    function copiarTexto(texto) {
      navigator.clipboard?.writeText(texto).then(() => {
        toast.mostrar('Código copiado.', 'success');
      }).catch(() => {
        toast.mostrar(texto, 'info');
      });
    }

    function abrirPreview() {
      window.open(`${linkLoja.value}?preview=1`, '_blank', 'noopener');
    }

    async function emitirCortesiaForm() {
      try {
        const res = await emitirCortesia(props.eventoId, { ...formCortesia, lote_id: Number(formCortesia.lote_id) });
        cortesiaEmitida.value = { codigo_publico: res.codigo_publico, ingressos: res.ingressos || [] };
        toast.mostrar(`Cortesia emitida. Pedido ${res.codigo_publico}`, 'success');
        formCortesia.nome = '';
        formCortesia.email = '';
        await carregar({ silencioso: true });
      } catch (err) {
        cortesiaEmitida.value = null;
        toast.mostrar(err.response?.data?.erro || 'Erro na cortesia.', 'error');
      }
    }

    async function emitirPortaForm() {
      try {
        const payload = {
          nome: formPorta.nome,
          quantidade: formPorta.quantidade || 1,
        };
        if (formPorta.email) payload.email = formPorta.email;
        if (formPorta.lote_id) payload.lote_id = Number(formPorta.lote_id);
        const res = await emitirVendaPorta(props.eventoId, payload);
        portaEmitida.value = { codigo_publico: res.codigo_publico, ingressos: res.ingressos || [] };
        toast.mostrar(`Venda na porta. Pedido ${res.codigo_publico}`, 'success');
        formPorta.nome = '';
        formPorta.email = '';
        await carregar({ silencioso: true });
      } catch (err) {
        portaEmitida.value = null;
        toast.mostrar(err.response?.data?.erro || 'Erro na venda na porta.', 'error');
      }
    }

    function baixarCsv() {
      baixarCompradoresCsv(props.eventoId).then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compradores-${props.eventoId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }).catch(() => toast.mostrar('Erro ao exportar CSV.', 'error'));
    }

    async function abrirListaPortaClick() {
      try {
        const blob = await abrirListaPorta(props.eventoId);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
      } catch {
        toast.mostrar('Erro ao abrir lista.', 'error');
      }
    }

    async function criarCupomForm() {
      try {
        await criarCupom(props.eventoId, { ...formCupom });
        formCupom.codigo = '';
        toast.mostrar('Cupom criado.', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao criar cupom.', 'error');
      }
    }

    async function cancelarPedidoClick(comprador) {
      if (!confirm(`Cancelar pedido ${comprador.codigo_publico} (${comprador.nome})?`)) return;
      try {
        await cancelarPedido(props.eventoId, comprador.codigo_publico);
        toast.mostrar('Pedido cancelado.', 'success');
        secaoAberta.value = 'compradores';
        await carregar({ silencioso: true });
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro ao cancelar pedido.', 'error');
      }
    }

    watch(() => props.eventoId, () => {
      secaoAberta.value = 'lotes';
      carregar();
    });
    onMounted(carregar);

    return {
      carregando,
      atualizando,
      erro,
      resumo,
      formMeta,
      formCusto,
      formLote,
      simulador,
      precificacaoSimulada,
      linkLoja,
      baseLoja,
      compradores,
      filtrosCompradores,
      formCortesia,
      formPorta,
      formCupom,
      cortesiaEmitida,
      portaEmitida,
      lotesEdit,
      salvandoMeta,
      secaoAberta,
      abrirSecao,
      formatarMoeda,
      badgeStatus,
      salvarLote,
      salvarMeta,
      adicionarCusto,
      removerCusto,
      adicionarLote,
      removerLote,
      gerarLotesSugeridosClick,
      aplicarSugestao,
      alternarPublicacao,
      copiarLink,
      copiarTexto,
      abrirPreview,
      emitirCortesiaForm,
      emitirPortaForm,
      criarCupomForm,
      cancelarPedidoClick,
      baixarCsv,
      abrirListaPorta: abrirListaPortaClick,
      atualizarSimulador,
      carregarCompradores,
    };
  },
};
</script>

<style scoped>
.bandeja {
  border: 1px solid var(--beco-line);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--beco-row);
}

.bandeja-btn {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--beco-fg);
  cursor: pointer;
}

.bandeja-btn:hover {
  background: rgba(255, 255, 255, 0.03);
}

.bandeja-seta {
  flex-shrink: 0;
  color: var(--beco-muted);
  font-size: 0.85rem;
}

.bandeja-corpo {
  padding: 0 1rem 1rem;
  border-top: 1px solid var(--beco-line);
  padding-top: 1rem;
}
</style>
