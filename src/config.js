const API_PRODUCAO = 'https://api-beco-underground.onrender.com';

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : API_PRODUCAO);
export const LOJA_INGRESSOS_URL = import.meta.env.VITE_LOJA_INGRESSOS_URL || 'https://ingressosbeco.raulnikroyce.dev';
