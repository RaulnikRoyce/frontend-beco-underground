import { defineStore } from 'pinia';

export const useToastStore = defineStore('toast', {
  state: () => ({
    itens: [],
    sequencia: 0,
  }),

  actions: {
    mostrar(mensagem, tipo = 'info') {
      const id = ++this.sequencia;
      this.itens.push({ id, mensagem, tipo });
      setTimeout(() => {
        this.itens = this.itens.filter((item) => item.id !== id);
      }, 3200);
    },
  },
});
