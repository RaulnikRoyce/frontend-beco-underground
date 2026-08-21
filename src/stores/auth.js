import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token_beco') || null,
    perfil: localStorage.getItem('perfil_beco') || null,
    email: localStorage.getItem('email_beco') || null,
    usuarioId: Number(localStorage.getItem('usuario_id_beco')) || null,
  }),

  getters: {
    estaLogado: (state) => !!state.token,
    isAdmin: (state) => state.perfil === 'admin',
    perfilLabel: (state) => (state.perfil === 'admin' ? 'Administrador' : 'Produtor'),
    iniciais: (state) => {
      const base = (state.email || 'B').split('@')[0];
      return base.slice(0, 2).toUpperCase();
    },
    primeiroNome: (state) => (state.email || 'equipe').split('@')[0],
    saudacao: () => {
      const hora = new Date().getHours();
      if (hora < 12) return 'Bom dia';
      if (hora < 18) return 'Boa tarde';
      return 'Boa noite';
    },
  },

  actions: {
    salvarLogin(token, perfil, email, usuarioId) {
      this.token = token;
      this.perfil = perfil;
      this.email = email || null;
      this.usuarioId = usuarioId || null;
      localStorage.setItem('token_beco', token);
      localStorage.setItem('perfil_beco', perfil);
      if (email) localStorage.setItem('email_beco', email);
      if (usuarioId) localStorage.setItem('usuario_id_beco', String(usuarioId));
    },

    fazerLogout() {
      this.token = null;
      this.perfil = null;
      this.email = null;
      this.usuarioId = null;
      localStorage.removeItem('token_beco');
      localStorage.removeItem('perfil_beco');
      localStorage.removeItem('email_beco');
      localStorage.removeItem('usuario_id_beco');
    },
  },
});
