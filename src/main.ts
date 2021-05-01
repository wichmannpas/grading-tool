import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'spectre.css/dist/spectre.min.css'
import 'spectre.css/dist/spectre-icons.min.css'
import '@/assets/base.scss'

createApp(App).use(router).mount('#app')
