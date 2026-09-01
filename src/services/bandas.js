import api from '../api';

export async function listarBandas() {
  const { data } = await api.get('/bandas');
  return data;
}

export async function criarBanda(payload) {
  const { data } = await api.post('/bandas', payload);
  return data;
}

export async function excluirBanda(id) {
  const { data } = await api.delete(`/bandas/${id}`);
  return data;
}

export async function atualizarBanda(id, payload) {
  const { data } = await api.patch(`/bandas/${id}`, payload);
  return data;
}
