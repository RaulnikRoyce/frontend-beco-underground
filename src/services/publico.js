import api from '../api';

export async function buscarPaginaBanda(token) {
  const { data } = await api.get(`/publico/${token}`);
  return data;
}
