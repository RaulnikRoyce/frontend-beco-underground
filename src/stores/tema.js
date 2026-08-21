import { defineStore } from 'pinia';

const CHAVE = 'tema_beco';

export const useTemaStore = defineStore('tema', {
  state: () => ({
    modo: typeof localStorage !== 'undefined' && localStorage.getItem(CHAVE) === 'claro'
      ? 'claro'
      : 'escuro',
  }),

  getters: {
    escuro: (state) => state.modo === 'escuro',
  },

  actions: {
    aplicar() {
      document.documentElement.classList.toggle('tema-claro', this.modo === 'claro');
      document.documentElement.classList.toggle('tema-escuro', this.modo === 'escuro');
    },
    alternar() {
      this.modo = this.escuro ? 'claro' : 'escuro';
      localStorage.setItem(CHAVE, this.modo);
      this.aplicar();
    },
  },
});
