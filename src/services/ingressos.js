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

export async function emitirCortesia(eventoId, payload) {
  const { data } = await api.post(`/eventos/${eventoId}/ingressos/cortesia`, payload);
  return data;
}
