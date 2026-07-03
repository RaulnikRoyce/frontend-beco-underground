<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 p-8 print:bg-white print:text-black print:p-0">
    
    <header class="mb-10 border-b border-zinc-800 pb-6 print:hidden">
      <h1 class="text-4xl font-black uppercase tracking-tighter text-red-600">Beco Underground</h1>
      <p class="text-zinc-500 uppercase tracking-widest text-sm">Painel de Gestão Integrado</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 print:block">
      
      <main class="grid gap-6 content-start print:block">
        <h2 class="text-2xl font-bold border-b border-zinc-800 pb-2 text-zinc-100 uppercase tracking-wide print:hidden">Eventos</h2>
        
        <section class="bg-zinc-900 border border-zinc-800 p-6 shadow-xl print:hidden">
          <h3 class="text-xs font-bold mb-4 text-red-500 uppercase tracking-widest">Criar Novo Evento</h3>
          <div class="flex flex-col gap-3">
            <input v-model="novoEvento.nome" placeholder="Nome do Evento" class="bg-zinc-950 border border-zinc-700 p-2 outline-none focus:border-red-600">
            <div class="flex gap-3">
              <input v-model="novoEvento.data" type="date" class="bg-zinc-950 border border-zinc-700 p-2 outline-none focus:border-red-600 w-1/2">
              <input v-model="novoEvento.local" placeholder="Local" class="bg-zinc-950 border border-zinc-700 p-2 outline-none focus:border-red-600 w-1/2">
            </div>
            <button @click="adicionarEvento" class="bg-red-600 px-6 py-2 font-bold hover:bg-red-700 transition-colors mt-2 uppercase text-sm">Cadastrar Evento</button>
          </div>
        </section>

        <div v-for="evento in eventos" :key="evento.id" class="bg-zinc-900 border border-zinc-800 p-6 shadow-xl relative group print:bg-white print:border-none print:shadow-none print:p-0 print:page-break-inside-avoid print:mb-10">
          
          <div class="absolute top-6 right-6 flex gap-4 print:hidden">
            <button @click="imprimirCronograma" class="text-zinc-400 hover:text-white transition-colors uppercase text-xs font-bold flex items-center gap-1">
              🖨️ Imprimir
            </button>
            <button @click="deletarEvento(evento.id)" class="text-zinc-600 hover:text-red-500 transition-colors uppercase text-xs font-bold">Excluir</button>
          </div>
          
          <h2 class="text-xl font-bold mb-1 w-3/4 print:text-3xl print:text-black print:mb-2">{{ evento.nome }}</h2>
          <p class="text-sm text-zinc-400 mb-6 print:text-black print:font-bold print:text-lg">📅 {{ new Date(evento.data).toLocaleDateString('pt-BR') }} | 📍 {{ evento.local }}</p>
          
          <div class="border-t border-zinc-800 pt-4 print:border-black print:pt-6">
            <h4 class="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex justify-between print:text-black print:text-lg print:border-b print:border-black print:pb-2">
              Cronograma de Palco
              <span class="text-zinc-500 print:hidden">Custo Total: R$ {{ calcularCusto(evento.id) }}</span>
            </h4>
            
            <ul class="mb-4 space-y-2 print:space-y-4">
              <li v-for="item in lineups[evento.id]" :key="item.lineup_id" class="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-800 text-sm print:bg-white print:border-b print:border-gray-300 print:p-2">
                <span class="print:text-black print:text-lg"><strong class="text-zinc-300 print:text-black">{{ item.horario || '--:--' }}</strong> | {{ item.nome }}</span>
                <span class="text-emerald-500 font-mono text-xs print:hidden">R$ {{ item.cache }}</span>
              </li>
              <li v-if="!lineups[evento.id] || lineups[evento.id].length === 0" class="text-zinc-600 text-xs italic">Nenhum artista escalado.</li>
            </ul>

            <div class="flex gap-2 print:hidden">
              <select v-model="evento.novaBandaId" class="bg-zinc-950 border border-zinc-700 p-2 text-sm outline-none focus:border-red-600 flex-1 text-zinc-300">
                <option value="" disabled>Selecionar Artista...</option>
                <option v-for="banda in bandas" :key="banda.id" :value="banda.id">{{ banda.nome }}</option>
              </select>
              <input v-model="evento.novoHorario" type="time" class="bg-zinc-950 border border-zinc-700 p-2 text-sm outline-none focus:border-red-600 text-zinc-300">
              <button @click="adicionarAoLineup(evento)" class="bg-zinc-800 hover:bg-red-600 text-white px-3 py-2 text-xs font-bold transition-colors uppercase">Add</button>
            </div>
          </div>
        </div>
      </main>

      <main class="grid gap-6 content-start print:hidden">
        <h2 class="text-2xl font-bold border-b border-zinc-800 pb-2 text-zinc-100 uppercase tracking-wide">Bandas</h2>
        
        <section class="bg-zinc-900 border border-zinc-800 p-6 shadow-xl">
          <h3 class="text-xs font-bold mb-4 text-red-500 uppercase tracking-widest">Cadastrar Artista</h3>
          <div class="flex flex-col gap-3">
            <input v-model="novaBanda.nome" placeholder="Nome da Banda / Artista" class="bg-zinc-950 border border-zinc-700 p-2 outline-none focus:border-red-600">
            <input v-model="novaBanda.genero" placeholder="Gênero" class="bg-zinc-950 border border-zinc-700 p-2 outline-none focus:border-red-600">
            <div class="flex gap-3">
              <input v-model="novaBanda.cache_base" type="number" placeholder="Cachê (R$)" class="bg-zinc-950 border border-zinc-700 p-2 outline-none focus:border-red-600 w-1/2">
              <input v-model="novaBanda.contato" placeholder="Contato" class="bg-zinc-950 border border-zinc-700 p-2 outline-none focus:border-red-600 w-1/2">
            </div>
            <button @click="adicionarBanda" class="bg-red-600 px-6 py-2 font-bold hover:bg-red-700 transition-colors mt-2 uppercase text-sm">Cadastrar Artista</button>
          </div>
        </section>

        <div v-for="banda in bandas" :key="banda.id" class="bg-zinc-900 border border-zinc-800 p-6 relative group shadow-xl">
          <button @click="deletarBanda(banda.id)" class="absolute top-6 right-6 text-zinc-600 hover:text-red-500 transition-colors uppercase text-xs font-bold">Excluir</button>
          <div class="flex items-start mb-2 w-5/6">
            <h2 class="text-xl font-bold mr-3">{{ banda.nome }}</h2>
            <span class="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-1 uppercase font-bold tracking-wider rounded">{{ banda.genero }}</span>
          </div>
          <p class="text-sm text-zinc-400 mb-1">📞 {{ banda.contato }}</p>
          <p class="text-sm text-emerald-500 font-mono font-bold">💰 R$ {{ banda.cache_base }}</p>
        </div>
      </main>

    </div>
  </div>
</template>

<script>
import api from './api';

export default {
  data() {
    return {
      eventos: [],
      bandas: [],
      lineups: {}, // Objeto para guardar os lineups por ID do evento
      novoEvento: { nome: '', data: '', local: '' },
      novaBanda: { nome: '', genero: '', contato: '', cache_base: '' }
    };
  },
  mounted() {
    this.buscarEventos();
    this.buscarBandas();
  },
  methods: {
    // EVENTOS
    async buscarEventos() {
      try {
        const resposta = await api.get('/eventos');
        // Prepara os campos de nova banda e novo horário para cada evento da lista
        this.eventos = resposta.data.map(e => ({ ...e, novaBandaId: '', novoHorario: '' }));
        // Busca o lineup de cada evento
        this.eventos.forEach(evento => this.buscarLineup(evento.id));
      } catch (err) { console.error("Erro", err); }
    },
    imprimirCronograma() {
      window.print();
    },
    async adicionarEvento() {
      await api.post('/eventos', this.novoEvento);
      this.novoEvento = { nome: '', data: '', local: '' };
      this.buscarEventos();
    },
    async deletarEvento(id) {
      if (confirm('Excluir este evento?')) {
        await api.delete(`/eventos/${id}`);
        this.buscarEventos();
      }
    },

    // BANDAS
    async buscarBandas() {
      const resposta = await api.get('/bandas');
      this.bandas = resposta.data;
    },
    async adicionarBanda() {
  try {
    await api.post('/bandas', this.novaBanda);
    this.novaBanda = { nome: '', genero: '', contato: '', cache_base: '' };
    this.buscarBandas();
  } catch (err) {
    // Se for erro do Zod (400), mostra o detalhe. Se for erro de login (401/403), avisa.
    if (err.response && err.response.data.detalhes) {
      const msgs = err.response.data.detalhes.map(d => d.mensagem).join('\n');
      alert('Erro na validação:\n' + msgs);
    } else if (err.response?.status === 403) {
      alert('Acesso Negado: Você precisa ser Administrador para esta ação.');
    } else {
      alert('Erro ao processar a requisição.');
    }
  }
},
    async deletarBanda(id) {
      if (confirm('Excluir este artista?')) {
        await api.delete(`/bandas/${id}`);
        this.buscarBandas();
      }
    },

    // LINE-UP
    async buscarLineup(eventoId) {
      const resposta = await api.get(`/lineup/${eventoId}`);
      this.lineups[eventoId] = resposta.data;
    },
    async adicionarAoLineup(evento) {
      if (!evento.novaBandaId) return alert('Selecione uma banda!');
      
      const payload = {
        evento_id: evento.id,
        banda_id: evento.novaBandaId,
        horario: evento.novoHorario || null
      };
      
      await api.post('/lineup', payload);
      evento.novaBandaId = '';
      evento.novoHorario = '';
      this.buscarLineup(evento.id); // Atualiza apenas o lineup deste evento
    },
    calcularCusto(eventoId) {
      const lineup = this.lineups[eventoId];
      if (!lineup || lineup.length === 0) return '0.00';
      const soma = lineup.reduce((total, item) => total + parseFloat(item.cache || 0), 0);
      return soma.toFixed(2);
    }
  }
};
</script>