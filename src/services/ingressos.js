import api from '../api';

export async function obterResumoIngressos(eventoId) {
  const { data } = await api.get(`/eventos/${eventoId}/ingressos/resumo`);
  return data;
}

export async function obterPrecificacao(eventoId, params = {}) {
  const { data } = await api.get(`/eventos/${eventoId}/ingressos/precificacao`, { params });
  return data;
}

export async function atualizarConfigIngressos(eventoId, payload) {
  const { data } = await api.patch(`/eventos/${eventoId}/ingressos/config`, payload);
  return data;
}

export async function publicarVenda(eventoId, publicado = true) {
  const { data } = await api.patch(`/eventos/${eventoId}/ingressos/publicar`, { publicado });
  return data;
}

export async function criarTokenPreview(eventoId) {
  const { data } = await api.post(`/eventos/${eventoId}/ingressos/preview-token`);
  return data.token;
}

export async function listarCustos(eventoId) {
  const { data } = await api.get(`/eventos/${eventoId}/custos`);
  return data;
}

export async function criarCusto(eventoId, payload) {
  const { data } = await api.post(`/eventos/${eventoId}/custos`, payload);
  return data;
}

export async function atualizarCusto(eventoId, custoId, payload) {
  const { data } = await api.patch(`/eventos/${eventoId}/custos/${custoId}`, payload);
  return data;
}

export async function excluirCusto(eventoId, custoId) {
  const { data } = await api.delete(`/eventos/${eventoId}/custos/${custoId}`);
  return data;
}

export async function listarLotes(eventoId) {
  const { data } = await api.get(`/eventos/${eventoId}/lotes`);
  return data;
}

export async function criarLote(eventoId, payload) {
  const { data } = await api.post(`/eventos/${eventoId}/lotes`, payload);
  return data;
}

export async function atualizarLote(eventoId, loteId, payload) {
  const { data } = await api.patch(`/eventos/${eventoId}/lotes/${loteId}`, payload);
  return data;
}

export async function excluirLote(eventoId, loteId) {
  const { data } = await api.delete(`/eventos/${eventoId}/lotes/${loteId}`);
  return data;
}

export async function gerarLotesSugeridos(eventoId) {
  const { data } = await api.post(`/eventos/${eventoId}/lotes/gerar-sugeridos`);
  return data;
}

export async function emitirCortesia(eventoId, payload) {
  const { data } = await api.post(`/eventos/${eventoId}/ingressos/cortesia`, payload);
  return data;
}

export async function emitirVendaPorta(eventoId, payload) {
  const { data } = await api.post(`/eventos/${eventoId}/ingressos/porta`, payload);
  return data;
}

export async function listarCompradores(eventoId, params = {}) {
  const { data } = await api.get(`/eventos/${eventoId}/ingressos/compradores`, { params });
  return data;
}

export function urlCompradoresCsv(eventoId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  return `/eventos/${eventoId}/ingressos/compradores.csv${qs ? `?${qs}` : ''}`;
}

export async function baixarCompradoresCsv(eventoId, params = {}) {
  const { data } = await api.get(urlCompradoresCsv(eventoId, params), { responseType: 'blob' });
  return data;
}

export async function abrirListaPorta(eventoId) {
  const { data } = await api.get(`/eventos/${eventoId}/ingressos/lista-porta.pdf`, { responseType: 'blob' });
  return data;
}

export async function checkin(codigo) {
  const { data } = await api.post(`/ingressos/checkin/${codigo}`);
  return data;
}

export async function obterFinanceiroDashboard() {
  const { data } = await api.get('/ingressos/dashboard/financeiro');
  return data;
}

export async function criarCupom(eventoId, payload) {
  const { data } = await api.post(`/eventos/${eventoId}/ingressos/cupons`, payload);
  return data;
}

export async function cancelarPedido(eventoId, codigo) {
  const { data } = await api.post(`/eventos/${eventoId}/ingressos/pedidos/${codigo}/cancelar`);
  return data;
}
