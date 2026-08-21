import api from '../api';

const desempacotar = (data) => (Array.isArray(data) ? data : data?.dados || []);

export async function listarEventos(params = { include: 'lineup' }) {
  const { data } = await api.get('/eventos', { params });
  return desempacotar(data);
}

export async function criarEvento(payload) {
  const { data } = await api.post('/eventos', payload);
  return data;
}

export async function excluirEvento(id) {
  const { data } = await api.delete(`/eventos/${id}`);
  return data;
}
