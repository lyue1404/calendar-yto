import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import Calendar from '../lib/install';
import './assets/icons';
import LunarCalendar from '../lib/LunarCalendar.js';
import forbidScrolling from '../lib/forbidScrolling.js';

LunarCalendar();
forbidScrolling();

Vue.config.productionTip = false;
Vue.use(Calendar);
new Vue({
  render: (h) => h(App),
}).$mount('#app');
