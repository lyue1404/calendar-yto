import { calendar, inlineCalendarYto } from './index';

const install = function(Vue) {
  if (install.installed) return;
  Vue.component(calendar.name, calendar);
  Vue.component(inlineCalendarYto.name, inlineCalendarYto);
};

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  calendar,
  inlineCalendarYto,
};
