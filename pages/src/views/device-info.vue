<template>
    <div class="row">
      <div class="field">设备IMEI号：</div>
      <div class="value">{{ activeDevice.sign }}</div>
    </div>
    <div class="row">
      <div class="field">设备SIM卡号：</div>
      <div class="value">{{ activeDevice.sim }}</div>
    </div>
    <div class="row">
      <div class="field">设备软件版本号：</div>
    </div>
    <div class="row">
      <div class="value">{{ activeDevice.settings.version }}</div>
    </div>
</template>
<script>
  export default {
    vuex: {
      getters: {
        activeDevice: state => state.activeDevice
      }
    },
    route: {
      data() {
        console.log(this.activeDevice.settings);
      }
    },
    data() {
      return {
        
      }
    },
    methods: {
      
    },
    watch: {
      
    }
  }
</script>
<style scoped>
  .row {
    padding: 16px;
    display: flex;
    align-items: center;
  }
</style>