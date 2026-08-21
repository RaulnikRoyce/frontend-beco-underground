import api from '../api';

export async function listarLineup(eventoId) {
  const { data } = await api.get(`/lineup/${eventoId}`);
  return data;
}

export async function escalarArtista(payload) {
  const { data } = await api.post('/lineup', payload);
  return data;
}
