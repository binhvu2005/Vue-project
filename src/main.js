import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store'
import { Clerk } from '@clerk/clerk-js';
const clerk = new Clerk('pk_test_ZXhjaXRlZC1tYXJtb3QtMTMuY2xlcmsuYWNjb3VudHMuZGV2JA');
clerk.load();

const app = createApp(App)

app.use(router)
app.use(store)
app.mount('#app')
