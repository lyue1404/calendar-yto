<template>
  <popover :show.sync="show">
    <inlineCalendarYto v-bind="$props" @change="handelChange" @switch="handelSwitch"></inlineCalendarYto>
  </popover>
</template>

<script>
import './index.less';
import popover from './popover';
import inlineCalendarYto from './inlineCalendar';

export default {
  name: 'calendar',
  components: {
    popover,
    inlineCalendarYto,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    ...inlineCalendarYto.props,
  },
  methods: {
    handelChange(val) {
      this.$emit('change', val);
    },
    handelSwitch(val) {
      this.$emit('switch', val);
    },
  },
};
</script>
