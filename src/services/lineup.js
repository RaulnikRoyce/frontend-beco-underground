import api from '../api';

export async function listarLineup(eventoId) {
  const { data } = await api.get(`/lineup/${eventoId}`);
  return data;
}

export async function escalarArtista(payload) {
  const { data } = await api.post('/lineup', payload);
  return data;
}

export async function atualizarSlot(id, payload) {
  const { data } = await api.patch(`/lineup/${id}`, payload);
  return data;
}

export async function removerSlot(id) {
  const { data } = await api.delete(`/lineup/${id}`);
  return data;
}
