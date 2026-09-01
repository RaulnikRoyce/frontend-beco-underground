<template>
  <div class="shell">
    <a href="#conteudo" class="skip-link no-print">Pular para o conteúdo</a>
    <div class="dots no-print" aria-hidden="true"></div>
    <div class="orbs no-print" aria-hidden="true"></div>

    <aside class="sidebar hidden lg:flex no-print">
      <AppSidebar @sair="sair" />
    </aside>

    <div v-if="menuAberto" class="overlay lg:hidden" @click="menuAberto = false"></div>
    <aside id="menu-mobile" class="sidebar-mobile lg:hidden" :class="{ open: menuAberto }">
      <AppSidebar @sair="sair" @navegar="menuAberto = false" />
    </aside>

    <header class="topbar no-print">
      <button
        class="hamburger lg:hidden"
        type="button"
        :aria-expanded="menuAberto"
        aria-controls="menu-mobile"
        aria-label="Abrir menu"
        @click="menuAberto = !menuAberto"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <label class="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
        <input
          v-model="painel.busca"
          type="search"
          placeholder="Buscar eventos..."
          aria-label="Buscar eventos"
          @keyup.enter="irParaEventos"
        />
      </label>

      <button
        class="tema-btn"
        type="button"
        :aria-pressed="!tema.escuro"
        :aria-label="tema.escuro ? 'Ativar tema claro' : 'Ativar tema escuro'"
        @click="tema.alternar()"
      >
        {{ tema.escuro ? 'Claro' : 'Escuro' }}
      </button>

      <div class="topbar-user">
        <span class="avatar">{{ auth.iniciais }}</span>
        <div class="hidden sm:block">
          <p class="name">{{ auth.primeiroNome }}</p>
          <p class="role">{{ auth.perfilLabel }}</p>
        </div>
      </div>
    </header>

    <main id="conteudo" class="content" tabindex="-1">
      <p v-if="painel.erroCarga" class="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
        {{ painel.erroCarga }}
      </p>
      <slot />
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePainelStore } from '../stores/painel';
import { useToastStore } from '../stores/toast';
import { useTemaStore } from '../stores/tema';
import AppSidebar from './AppSidebar.vue';

export default {
  components: { AppSidebar },
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const painel = usePainelStore();
    const toast = useToastStore();
    const tema = useTemaStore();
    const menuAberto = ref(false);

    function sair() {
      auth.fazerLogout();
      painel.$reset();
      toast.mostrar('Sessão encerrada', 'info');
      router.push('/login');
    }

    function irParaEventos() {
      router.push('/eventos');
    }

    return { auth, painel, tema, menuAberto, sair, irParaEventos };
  },
};
</script>

<style scoped>
.skip-link {
  position: absolute;
  left: 12px;
  top: -40px;
  z-index: 400;
  padding: 8px 12px;
  background: #dc2626;
  color: white;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
}

.skip-link:focus {
  top: 12px;
}

.shell {
  min-height: 100vh;
  background: var(--beco-bg);
}

.dots,
.orbs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.dots {
  background-image: radial-gradient(var(--beco-dot) 1px, transparent 1px);
  background-size: 26px 26px;
}

.orbs {
  background:
    radial-gradient(ellipse 60% 50% at 10% 20%, var(--beco-red-soft) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 90% 80%, var(--beco-dot) 0%, transparent 55%);
}

.sidebar,
.topbar,
.content,
.sidebar-mobile {
  background: var(--beco-shell);
  color: var(--beco-fg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--beco-line);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}

.sidebar {
  position: fixed;
  top: var(--pad);
  left: calc(50% - 42.5vw);
  width: var(--sidebar-w);
  height: calc(100vh - var(--pad) * 2);
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  z-index: 100;
}

.sidebar-mobile {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-w);
  height: 100vh;
  flex-direction: column;
  z-index: 200;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar-mobile.open {
  transform: translateX(0);
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 199;
}

.topbar {
  position: fixed;
  top: var(--pad);
  left: calc(50% - 42.5vw + var(--sidebar-w) + 12px);
  right: calc(50% - 42.5vw);
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  border-radius: 16px;
  z-index: 100;
}

.hamburger {
  display: none;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: var(--beco-row);
  color: var(--beco-fg);
}

.search {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 440px;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--beco-row);
  border: 1px solid var(--beco-line);
  color: var(--beco-muted);
}

.search input {
  background: none;
  border: none;
  outline: none;
  color: var(--beco-fg);
  width: 100%;
  font-size: 13px;
}

.tema-btn {
  flex-shrink: 0;
  margin-left: auto;
  border: 1px solid var(--beco-line);
  background: var(--beco-row);
  color: var(--beco-fg);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #3f3f46, #dc2626);
  border: 2px solid rgba(220, 38, 38, 0.35);
}

.name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
}

.role {
  margin-top: 3px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #f87171;
}

.content {
  position: fixed;
  z-index: 1;
  left: calc(50% - 42.5vw + var(--sidebar-w) + 12px);
  right: calc(50% - 42.5vw);
  top: calc(var(--pad) + var(--topbar-h) + 12px);
  bottom: var(--pad);
  padding: 24px 28px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 16px;
  animation: fadeIn 0.35s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1024px) {
  .sidebar { left: 12px; }
  .topbar, .content {
    left: calc(12px + var(--sidebar-w) + 12px);
    right: 12px;
  }
}

@media (max-width: 1023px) {
  .hamburger { display: flex; }
  .topbar, .content {
    left: 12px;
    right: 12px;
  }
  .topbar { top: 12px; }
  .content {
    top: calc(12px + var(--topbar-h) + 12px);
    bottom: 12px;
  }
}

@media (max-width: 640px) {
  .content { padding: 16px 14px; }
}

@media print {
  .content {
    position: static;
    left: auto;
    right: auto;
    top: auto;
    bottom: auto;
    overflow: visible;
    padding: 0;
    border: none;
    box-shadow: none;
    background: white;
    backdrop-filter: none;
    border-radius: 0;
    animation: none;
  }
}
</style>
