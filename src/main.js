import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'virtual:uno.css';
import './style.css';
import App from './App.vue';
import router from './router';
import { useTemaStore } from './stores/tema';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
useTemaStore(pinia).aplicar();
app.use(router);
app.mount('#app');
