<template>
  <div id="app">
    <demo9 />
  </div>
</template>

<script>
import demo9 from './demos/demo9.vue';
export default {
  components: {
    demo9,
  },
};
</script>

<style lang="less">
html,
body {
  margin: 0;
  padding: 0;
  background: #eee;
}
#app{
  height: 100vh;
  padding: 0 10px;
  background:#F5F7FA;
}
.btn{
  padding: 5px 10px;
}
.title{
  text-align: center;
}
.demo{
  // border-radius: 2px;
  // box-shadow: 0 1px 5px rgba(0,0,0,.2), 0 2px 2px rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12);
  margin-bottom: 20px;
}
.demo-title{
  padding: 10px 0;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}
</style>
