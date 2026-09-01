<template>
  <AppLayout>
    <h1 class="text-3xl font-extrabold">Check-in na porta</h1>
    <p class="mt-1 text-sm text-zinc-400">Digite o código do QR ou escaneie com o leitor.</p>

    <form class="panel-card mt-6 grid gap-3 p-6" @submit.prevent="validar">
      <label class="grid gap-1 text-sm">
        <span class="text-zinc-400">Código do ingresso</span>
        <input v-model="codigo" class="field font-mono" autocomplete="off" required />
      </label>
      <button type="submit" class="btn-primary" :disabled="enviando">Validar entrada</button>
    </form>

    <div v-if="resultado" class="panel-card mt-4 p-6" :class="resultado.valido ? 'border-green-500/40' : 'border-amber-500/40'">
      <p class="text-lg font-bold" :class="resultado.valido ? 'text-green-400' : 'text-amber-300'">
        {{ resultado.valido ? 'Entrada liberada' : mensagemErro }}
      </p>
      <p v-if="resultado.ingresso" class="mt-2 text-sm text-zinc-400">
        {{ resultado.ingresso.evento_nome }} · {{ resultado.ingresso.comprador_nome }}
      </p>
    </div>
  </AppLayout>
</template>

<script>
import { computed, ref } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { checkin } from '../services/ingressos';
import { useToastStore } from '../stores/toast';

export default {
  components: { AppLayout },
  setup() {
    const toast = useToastStore();
    const codigo = ref('');
    const enviando = ref(false);
    const resultado = ref(null);

    const mensagemErro = computed(() => {
      if (!resultado.value || resultado.value.valido) return '';
      if (resultado.value.motivo === 'ja_usado') return 'Ingresso já usado';
      if (resultado.value.motivo === 'cancelado') return 'Ingresso cancelado';
      return 'Ingresso inválido';
    });

    async function validar() {
      enviando.value = true;
      resultado.value = null;
      try {
        resultado.value = await checkin(codigo.value.trim());
        if (resultado.value.valido) {
          toast.mostrar('Entrada registrada.', 'success');
          codigo.value = '';
        }
      } catch (err) {
        toast.mostrar(err.response?.data?.erro || 'Erro no check-in.', 'error');
      } finally {
        enviando.value = false;
      }
    }

    return { codigo, enviando, resultado, mensagemErro, validar };
  }
};
</script>
