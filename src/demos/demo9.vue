<template>
  <div id="demo-9" class="demo">
    <div class="demo-title">圆通日历</div>
    <inlineCalendar>
      <template v-slot:day="scope">
        <div v-if="scope.date.value === 1" class="point"></div>
      </template>
    </inlineCalendar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      year: undefined,
      month: undefined,
    };
  },
  methods: {
  },
};
</script>

<style scoped  lang="less">
  #demo-9{
    padding: 10px 0;
    // background: #fff;
    .note{
      font-size: 14px;
      padding: 10px 0;
      color: red;
    }
  }
  .point{
    width: 6px;
    height: 6px;
    border: 1px solid #D5DBE6;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    bottom: 10%;
    right:42%;
  }
</style>
