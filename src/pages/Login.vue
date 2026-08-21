<template>
  <div class="auth-root">
    <div class="dots" aria-hidden="true"></div>
    <div class="orbs" aria-hidden="true"></div>

    <section class="brand hidden lg:flex" aria-label="Sobre o painel">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-red-400">Produção independente</p>
        <h1 class="mt-4 max-w-md text-5xl font-extrabold leading-tight">
          Gerencie eventos com fluidez
        </h1>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
          Cronograma, artistas e cachês em um painel pensado para o Beco Underground.
        </p>
        <ul class="mt-8 space-y-3 text-sm text-zinc-300">
          <li>Lineup com horário e custo</li>
          <li>Cadastro de artistas e cachê base</li>
          <li>Impressão do cronograma de palco</li>
        </ul>
      </div>
      <p class="text-xs uppercase tracking-[0.25em] text-zinc-600">Sábado Maldito</p>
    </section>

    <section class="form-side">
      <form class="form-card" aria-describedby="login-status" @submit.prevent="entrar">
        <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-red-400 lg:hidden">Beco Underground</p>
        <h2 class="mt-2 text-3xl font-bold">Bem-vindo de volta</h2>
        <p class="mt-2 text-sm text-zinc-400">Use suas credenciais de produção.</p>

        <label class="mt-8 block" for="email">
          <span class="mb-2 block text-xs font-semibold text-zinc-400">E-mail</span>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            autocomplete="email"
            class="field"
            placeholder="admin@beco.com"
            required
          />
        </label>
        <label class="mt-4 block" for="senha">
          <span class="mb-2 block text-xs font-semibold text-zinc-400">Senha</span>
          <input
            id="senha"
            v-model="senha"
            type="password"
            autocomplete="current-password"
            class="field"
            placeholder="••••••••"
            required
          />
        </label>

        <p id="login-status" class="mt-4 text-sm text-red-400" role="alert" aria-live="polite">
          {{ erro }}
        </p>

        <button type="submit" class="btn-primary mt-6 w-full" :disabled="carregando" :aria-busy="carregando">
          {{ carregando ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../services/auth';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';

export default {
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const toast = useToastStore();
    const email = ref('');
    const senha = ref('');
    const erro = ref('');
    const carregando = ref(false);

    async function entrar() {
      carregando.value = true;
      erro.value = '';
      try {
        const dados = await login(email.value, senha.value);
        auth.salvarLogin(dados.token, dados.perfil, dados.email, dados.id);
        toast.mostrar('Login realizado', 'success');
        router.push('/');
      } catch (err) {
        if (err.response?.status === 400 && err.response.data.detalhes) {
          erro.value = err.response.data.detalhes.map((d) => d.mensagem).join(' · ');
        } else if (err.response?.data?.erro) {
          erro.value = err.response.data.erro;
        } else if (!err.response) {
          erro.value = 'Não foi possível conectar na API. Confira se o servidor está em http://localhost:3000.';
        } else {
          erro.value = 'E-mail ou senha incorretos.';
        }
      } finally {
        carregando.value = false;
      }
    }

    return { email, senha, erro, carregando, entrar };
  },
};
</script>

<style scoped>
.auth-root {
  min-height: 100vh;
  display: grid;
  background: #09090b;
}

.dots, .orbs {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.dots {
  background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 26px 26px;
}

.orbs {
  background:
    radial-gradient(ellipse 60% 50% at 8% 20%, rgba(220,38,38,0.16) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 90% 80%, rgba(255,255,255,0.04) 0%, transparent 55%);
}

@media (min-width: 1024px) {
  .auth-root { grid-template-columns: 1.1fr 0.9fr; }
}

.brand {
  position: relative;
  z-index: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
}

.form-side {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.form-card {
  width: 100%;
  max-width: 420px;
  padding: 32px;
  border-radius: 16px;
  background: rgba(12, 12, 14, 0.78);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(220, 38, 38, 0.16);
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
</style>
