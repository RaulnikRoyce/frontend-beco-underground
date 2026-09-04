<template>
  <div class="auth-root">
    <div class="dots" aria-hidden="true"></div>
    <div class="orbs" aria-hidden="true"></div>

    <section class="brand hidden lg:flex" aria-label="Sobre o cadastro">
      <div>
        <img src="/logo-beco.png" alt="Beco Underground Produções" class="h-28 w-28 rounded-full object-cover" width="112" height="112" />
        <p class="mt-6 text-[10px] font-bold uppercase tracking-[0.25em] text-red-400">Produção independente</p>
        <h1 class="mt-4 max-w-md text-5xl font-extrabold leading-tight">
          Entre como produtor
        </h1>
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-zinc-400">
          A conta fica com perfil de produtor, então você vê eventos e cria os seus. Só o admin escala artista e gerencia a equipe.
        </p>
      </div>
      <p class="text-xs uppercase tracking-[0.25em] text-zinc-600">Sábado Maldito</p>
    </section>

    <section class="form-side">
      <form class="form-card" aria-describedby="cadastro-status" @submit.prevent="enviar">
        <img src="/logo-beco.png" alt="Beco Underground Produções" class="mb-4 h-16 w-16 rounded-full object-cover lg:hidden" width="64" height="64" />
        <h2 class="mt-2 text-3xl font-bold">Criar conta</h2>
        <p class="mt-2 text-sm text-zinc-400">Cadastro de produtor. O admin pode desativar depois.</p>

        <label class="mt-8 block" for="email">
          <span class="mb-2 block text-xs font-semibold text-zinc-400">E-mail</span>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            autocomplete="email"
            class="field"
            required
          />
        </label>
        <label class="mt-4 block" for="senha">
          <span class="mb-2 block text-xs font-semibold text-zinc-400">Senha, no mínimo 12 caracteres</span>
          <input
            id="senha"
            v-model="senha"
            type="password"
            autocomplete="new-password"
            class="field"
            minlength="12"
            required
          />
        </label>
        <label class="mt-4 block" for="confirma">
          <span class="mb-2 block text-xs font-semibold text-zinc-400">Confirmar senha</span>
          <input
            id="confirma"
            v-model="confirma"
            type="password"
            autocomplete="new-password"
            class="field"
            minlength="12"
            required
          />
        </label>

        <p id="cadastro-status" class="mt-4 text-sm text-red-400" role="alert" aria-live="polite">
          {{ erro }}
        </p>

        <button type="submit" class="btn-primary mt-6 w-full" :disabled="carregando" :aria-busy="carregando">
          {{ carregando ? 'Cadastrando…' : 'Cadastrar' }}
        </button>

        <p class="mt-6 text-center text-sm text-zinc-500">
          Já tem conta?
          <RouterLink to="/login" class="font-semibold text-red-400 no-underline hover:text-red-300">Entrar</RouterLink>
        </p>
      </form>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registrar } from '../services/auth';
import { useToastStore } from '../stores/toast';

export default {
  setup() {
    const router = useRouter();
    const toast = useToastStore();
    const email = ref('');
    const senha = ref('');
    const confirma = ref('');
    const erro = ref('');
    const carregando = ref(false);

    async function enviar() {
      erro.value = '';
      if (senha.value !== confirma.value) {
        erro.value = 'As senhas não coincidem.';
        return;
      }

      carregando.value = true;
      try {
        await registrar(email.value, senha.value);
        toast.mostrar('Conta criada. Entre com e-mail e senha.', 'success');
        router.push('/login');
      } catch (err) {
        if (err.response?.status === 400 && err.response.data.detalhes) {
          erro.value = err.response.data.detalhes.map((d) => d.mensagem).join(' · ');
        } else if (err.response?.data?.erro) {
          erro.value = err.response.data.erro;
        } else if (!err.response) {
          erro.value = 'Não foi possível conectar na API.';
        } else {
          erro.value = 'Não foi possível cadastrar.';
        }
      } finally {
        carregando.value = false;
      }
    }

    return { email, senha, confirma, erro, carregando, enviar };
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
