import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/login', name: 'login', component: () => import('../pages/Login.vue'), meta: { publica: true } },
  { path: '/', name: 'dashboard', component: () => import('../pages/Dashboard.vue') },
  { path: '/eventos', name: 'eventos', component: () => import('../pages/Eventos.vue') },
  { path: '/eventos/:id', name: 'evento', component: () => import('../pages/EventoDetalhe.vue') },
  { path: '/artistas', name: 'artistas', component: () => import('../pages/Artistas.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.publica && !auth.estaLogado) return '/login';
  if (to.path === '/login' && auth.estaLogado) return '/';
  return true;
});

export default router;
