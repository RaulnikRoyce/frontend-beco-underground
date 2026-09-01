import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/login', name: 'login', component: () => import('../pages/Login.vue'), meta: { publica: true } },
  { path: '/cadastro', name: 'cadastro', component: () => import('../pages/Cadastro.vue'), meta: { publica: true } },
  { path: '/p/:token', name: 'palco', component: () => import('../pages/Palco.vue'), meta: { publica: true } },
  { path: '/', name: 'dashboard', component: () => import('../pages/Dashboard.vue') },
  { path: '/eventos', name: 'eventos', component: () => import('../pages/Eventos.vue') },
  { path: '/eventos/:id', name: 'evento', component: () => import('../pages/EventoDetalhe.vue') },
  { path: '/artistas', name: 'artistas', component: () => import('../pages/Artistas.vue') },
  { path: '/equipe', name: 'equipe', component: () => import('../pages/Equipe.vue'), meta: { admin: true } },
  { path: '/checkin', name: 'checkin', component: () => import('../pages/Checkin.vue'), meta: { admin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.publica && !auth.estaLogado) return '/login';
  if ((to.path === '/login' || to.path === '/cadastro') && auth.estaLogado) return '/';
  if (to.meta.admin && !auth.isAdmin) return '/';
  return true;
});

export default router;
