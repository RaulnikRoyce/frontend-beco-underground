import { defineStore } from 'pinia';
import { listarEventos, criarEvento, atualizarEvento, excluirEvento } from '../services/eventos';
import { listarBandas, criarBanda, excluirBanda } from '../services/bandas';
import { listarLineup, escalarArtista, atualizarSlot, removerSlot } from '../services/lineup';
import { useToastStore } from './toast';

const comCamposDeForm = (evento) => ({
  ...evento,
  novaBandaId: '',
  novoHorario: '',
});

export const usePainelStore = defineStore('painel', {
  state: () => ({
    carregando: false,
    erroCarga: '',
    eventos: [],
    bandas: [],
    lineups: {},
    busca: '',
  }),

  getters: {
    eventosFiltrados: (state) => {
      const termo = state.busca.trim().toLowerCase();
      if (!termo) return state.eventos;
      return state.eventos.filter((evento) =>
        `${evento.nome} ${evento.local}`.toLowerCase().includes(termo)
      );
    },

    custoTotalGeral: (state) =>
      Object.values(state.lineups)
        .flat()
        .reduce((total, item) => total + Number(item.cache || 0), 0),
  },

  actions: {
    custoDoEvento(eventoId) {
      const lineup = this.lineups[eventoId] || [];
      return lineup.reduce((total, item) => total + Number(item.cache || 0), 0);
    },

    async comLoading(fn) {
      this.carregando = true;
      try {
        await fn();
      } finally {
        this.carregando = false;
      }
    },

    tratarErro(err, fallback = 'Não foi possível concluir a ação') {
      const toast = useToastStore();
      if (err.response?.status === 400 && err.response.data.detalhes) {
        toast.mostrar(err.response.data.detalhes.map((d) => d.mensagem).join(' · '), 'error');
      } else if (err.response?.data?.erro) {
        toast.mostrar(err.response.data.erro, 'error');
      } else {
        toast.mostrar(fallback, 'error');
      }
    },

    aplicarEventos(lista) {
      this.eventos = lista.map(comCamposDeForm);
      const lineups = {};
      lista.forEach((evento) => {
        lineups[evento.id] = evento.lineup || this.lineups[evento.id] || [];
      });
      this.lineups = lineups;
    },

    async carregarTudo() {
      this.erroCarga = '';
      await this.comLoading(async () => {
        await Promise.all([this.buscarEventos(), this.buscarBandas()]);
      });
    },

    async buscarEventos() {
      try {
        const lista = await listarEventos({ include: 'lineup' });
        this.aplicarEventos(lista);
      } catch (error) {
        this.erroCarga = 'Não foi possível carregar os eventos.';
        this.tratarErro(error, 'Erro ao carregar eventos');
      }
    },

    async buscarBandas() {
      try {
        this.bandas = await listarBandas();
      } catch (error) {
        this.tratarErro(error, 'Erro ao carregar artistas');
      }
    },

    async buscarLineup(eventoId) {
      try {
        this.lineups[eventoId] = await listarLineup(eventoId);
      } catch (error) {
        this.tratarErro(error, 'Erro ao carregar lineup');
      }
    },

    async criarEvento(dados) {
      const toast = useToastStore();
      await this.comLoading(async () => {
        try {
          await criarEvento(dados);
          await this.buscarEventos();
          toast.mostrar('Evento criado', 'success');
        } catch (error) {
          this.tratarErro(error);
          throw error;
        }
      });
    },

    async atualizarEvento(id, dados) {
      const toast = useToastStore();
      await this.comLoading(async () => {
        try {
          await atualizarEvento(id, dados);
          await this.buscarEventos();
          toast.mostrar('Evento atualizado', 'success');
        } catch (error) {
          this.tratarErro(error);
          throw error;
        }
      });
    },

    async excluirEvento(id) {
      const toast = useToastStore();
      await this.comLoading(async () => {
        try {
          await excluirEvento(id);
          await this.buscarEventos();
          toast.mostrar('Evento excluído', 'success');
        } catch (error) {
          this.tratarErro(error);
        }
      });
    },

    async criarBanda(dados) {
      const toast = useToastStore();
      await this.comLoading(async () => {
        try {
          await criarBanda({ ...dados, cache_base: Number(dados.cache_base) });
          await this.buscarBandas();
          toast.mostrar('Artista cadastrado', 'success');
        } catch (error) {
          this.tratarErro(error);
          throw error;
        }
      });
    },

    async excluirBanda(id) {
      const toast = useToastStore();
      await this.comLoading(async () => {
        try {
          await excluirBanda(id);
          await this.buscarBandas();
          toast.mostrar('Artista excluído', 'success');
        } catch (error) {
          this.tratarErro(error);
        }
      });
    },

    async adicionarAoLineup(evento) {
      const toast = useToastStore();
      if (!evento.novaBandaId) {
        toast.mostrar('Selecione um artista', 'error');
        return;
      }

      await this.comLoading(async () => {
        try {
          await escalarArtista({
            evento_id: evento.id,
            banda_id: evento.novaBandaId,
            horario: evento.novoHorario || null,
          });
          evento.novaBandaId = '';
          evento.novoHorario = '';
          await this.buscarLineup(evento.id);
          toast.mostrar('Artista escalado', 'success');
        } catch (error) {
          this.tratarErro(error);
        }
      });
    },

    async atualizarSlot(lineupId, dados, eventoId) {
      const toast = useToastStore();
      await this.comLoading(async () => {
        try {
          await atualizarSlot(lineupId, dados);
          await this.buscarLineup(eventoId);
          toast.mostrar('Lineup atualizada', 'success');
        } catch (error) {
          this.tratarErro(error);
        }
      });
    },

    async removerDoLineup(lineupId, eventoId) {
      const toast = useToastStore();
      await this.comLoading(async () => {
        try {
          await removerSlot(lineupId);
          await this.buscarLineup(eventoId);
          toast.mostrar('Artista removido da lineup', 'success');
        } catch (error) {
          this.tratarErro(error);
        }
      });
    },
  },
});
