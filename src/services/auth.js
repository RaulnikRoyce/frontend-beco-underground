import api from '../api';

export async function login(email, senha) {
  const { data } = await api.post('/auth/login', { email, senha });
  return data;
}

export async function registrar(email, senha) {
  const { data } = await api.post('/auth/registrar', { email, senha });
  return data;
}

export async function listarUsuarios() {
  const { data } = await api.get('/auth/usuarios');
  return Array.isArray(data) ? data : [];
}

export async function alterarUsuario(id, ativo) {
  const { data } = await api.patch(`/auth/usuarios/${id}`, { ativo });
  return data;
}

export async function excluirUsuario(id) {
  const { data } = await api.delete(`/auth/usuarios/${id}`);
  return data;
}
