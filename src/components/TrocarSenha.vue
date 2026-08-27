<template>
  <div>
    <button
      type="button"
      class="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
      :aria-expanded="aberto"
      @click="aberto = !aberto"
    >
      Trocar senha
    </button>

    <form v-if="aberto" class="mt-1 space-y-2 px-1 pb-2" @submit.prevent="salvar">
      <label class="block" :for="idAtual">
        <span class="mb-1 block text-[10px] font-semibold text-zinc-500">Senha atual</span>
        <input
          :id="idAtual"
          v-model="senhaAtual"
          type="password"
          autocomplete="current-password"
          class="field py-2"
          required
        />
      </label>
      <label class="block" :for="idNova">
        <span class="mb-1 block text-[10px] font-semibold text-zinc-500">Nova senha (mín. 6)</span>
        <input
          :id="idNova"
          v-model="senhaNova"
          type="password"
          autocomplete="new-password"
          minlength="6"
          class="field py-2"
          required
        />
      </label>
      <button type="submit" class="btn-primary w-full py-2 text-xs" :disabled="enviando">
        {{ enviando ? 'Salvando…' : 'Salvar senha' }}
      </button>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useToastStore } from '../stores/toast';
import { trocarPropriaSenha } from '../services/auth';

export default {
  setup() {
    const toast = useToastStore();
    const aberto = ref(false);
    const senhaAtual = ref('');
    const senhaNova = ref('');
    const enviando = ref(false);
    const sufixo = Math.random().toString(36).slice(2, 8);
    const idAtual = `senha-atual-${sufixo}`;
    const idNova = `senha-nova-${sufixo}`;

    async function salvar() {
      if (senhaNova.value.length < 6) {
        toast.mostrar('Senha deve ter no mínimo 6 caracteres', 'error');
        return;
      }

      enviando.value = true;
      try {
        await trocarPropriaSenha(senhaAtual.value, senhaNova.value);
        toast.mostrar('Senha atualizada', 'success');
        senhaAtual.value = '';
        senhaNova.value = '';
        aberto.value = false;
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Não foi possível trocar a senha', 'error');
      } finally {
        enviando.value = false;
      }
    }

    return { aberto, senhaAtual, senhaNova, enviando, salvar, idAtual, idNova };
  },
};
</script>
