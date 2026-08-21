<template>
  <AppLayout>
    <div class="mb-6">
      <h1 class="text-3xl font-extrabold">Equipe</h1>
      <p class="mt-1 text-sm text-zinc-400">Produtores se cadastram sozinhos. Você ativa, bloqueia ou remove.</p>
    </div>

    <p v-if="erro" class="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
      {{ erro }}
    </p>

    <div class="space-y-3">
      <article
        v-for="usuario in usuarios"
        :key="usuario.id"
        class="panel-card flex flex-wrap items-center justify-between gap-4 p-5"
      >
        <div>
          <p class="font-semibold">{{ usuario.email }}</p>
          <p class="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            {{ usuario.perfil === 'admin' ? 'Administrador' : 'Produtor' }}
            ·
            <span :class="usuario.ativo ? 'text-emerald-400' : 'text-red-400'">
              {{ usuario.ativo ? 'Ativo' : 'Bloqueado' }}
            </span>
          </p>
        </div>
        <div v-if="usuario.id !== auth.usuarioId" class="flex flex-wrap gap-2">
          <button class="btn-ghost" type="button" @click="alternar(usuario)">
            {{ usuario.ativo ? 'Bloquear' : 'Ativar' }}
          </button>
          <button class="btn-ghost text-red-400 hover:text-red-300" type="button" @click="remover(usuario)">
            Excluir
          </button>
        </div>
        <p v-else class="text-xs text-zinc-500">Sua conta</p>
      </article>
    </div>

    <EmptyState
      v-if="!usuarios.length && !carregando"
      class="mt-4"
      titulo="Nenhum usuário"
      texto="Quando alguém se cadastrar como produtor, aparece aqui."
    />
  </AppLayout>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { listarUsuarios, alterarUsuario, excluirUsuario } from '../services/auth';
import AppLayout from '../components/AppLayout.vue';
import EmptyState from '../components/EmptyState.vue';

export default {
  components: { AppLayout, EmptyState },
  setup() {
    const auth = useAuthStore();
    const toast = useToastStore();
    const usuarios = ref([]);
    const carregando = ref(false);
    const erro = ref('');

    async function carregar() {
      carregando.value = true;
      erro.value = '';
      try {
        usuarios.value = await listarUsuarios();
      } catch {
        erro.value = 'Não foi possível carregar a equipe.';
      } finally {
        carregando.value = false;
      }
    }

    async function alternar(usuario) {
      try {
        const { usuario: atualizado } = await alterarUsuario(usuario.id, !usuario.ativo);
        usuarios.value = usuarios.value.map((item) => (item.id === atualizado.id ? atualizado : item));
        toast.mostrar(atualizado.ativo ? 'Conta ativada' : 'Conta bloqueada', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Não foi possível alterar a conta', 'error');
      }
    }

    async function remover(usuario) {
      if (!confirm(`Excluir ${usuario.email}? Essa pessoa não entra mais.`)) return;
      try {
        await excluirUsuario(usuario.id);
        usuarios.value = usuarios.value.filter((item) => item.id !== usuario.id);
        toast.mostrar('Usuário excluído', 'success');
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Não foi possível excluir', 'error');
      }
    }

    onMounted(carregar);

    return { auth, usuarios, carregando, erro, alternar, remover };
  },
};
</script>
