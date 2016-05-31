<template>
    <div class="full-page">
        <div class="hint">
            <img src="/resources/images/sm_ewm_bg.jpg" alt="">
            <div class="hint-text">
                <div class="center">找出觅宠背面的二维码</div>
                <div class="center">扫描后即可自动对接</div>
            </div>
        </div>
        <div class="button" @click="scan">立即扫描二维码</div>
    </div>
    <device-input v-show="scanned" :imei="imei"></device-input>
</template>

<script>
import deviceInput from './device-input.vue'
export default {
    components: {
        deviceInput
    },
    data() {
        return {
            scanned: false,
            imei: ''
        }
    },
    methods: {
        goHome() {
            this.$router.go('/home');
        },
        scan() {
            wx.scanQRCode({
              needResult: 1,
              desc: 'scanQRCode desc',
              success: function (res) {
                alert(JSON.stringify(res));
              }
            });
            // this.$router.go('/input');
            this.scanned = true;
            this.imei = '352116666688888';
        }
    }
}
</script>
<style scoped>
    .nav-menu-left {
        float: left;
        width: 24px;
    }
    .full-page {
        background: #f0f0f0;
    }
    .hint {
        position: relative;
        width: 70%;
        margin: 15% auto;
    }
    .hint img {
        width: 100%;
    }
    .hint-text {
        line-height: 20px;
        font-size: 14px;
        color: #999;
        position: absolute;
        bottom: 20px;
        width: 100%;
    }
</style>