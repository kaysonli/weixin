<template>
    <div class="full-page">
        <div class="img">
        </div>
        <div class="input">
            <div class="text-field flex-box">
                <input type="text" v-model="deviceName" class="name" name="name" placeholder="请输入宠管家昵称">
            </div>
            <div class="imei">
                <span>自动获取到IMEI号:</span>
                <span>{{imei}}</span>
            </div>
        </div>
        <div class="page-bottom">
            <div class="button" v-touch:tap="submit">完成</div>
            <div class="center">如有疑问请咨询：400-155-2158</div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['imei'],
    data() {
        return {
            deviceName: ''
        }
    },
    methods: {
        submit() {
            this.$http.post(this.$root.serverUrl + '/devices', {
                name: this.deviceName,
                imei: this.imei
            }).then(function(res) {
                if(res.data.status === 0) {
                    this.$router.go('/devices');
                    location.reload();
                }
            }, this);
        }
    }
}
</script>
<style scoped>
    .full-page {
        background: #fff;
    }
    .nav-menu-left {
        float: left;
        width: 24px;
    }
    .imei {
        font-size: 14px;
        color: gray;
        margin-left: 16px;
        margin-top: 15px;
        margin-bottom: 40px;
    }
    .fa {
        font-size: 20px;
    }
    .docked-bottom {
        background: #FEDA00;
        padding-top: 20px;
        padding-bottom: 50px;
    }

    .button {
        background: #fff;
    }

    input.name {
        background: url(/resources/images/new_ico.jpg) no-repeat;
        border: none;
        font-size: 14px;
        padding: 0 0 1rem 30px;
        line-height: 30px;
        padding-left: 2rem;
        margin-top: 1rem;
    }

    .text-field {
        padding-left: 16px;
    }

    .img {
        height: 200px;
        background: url(/resources/images/new.jpg) no-repeat center;
        background-size: 128px;
    }
    .img img {
        width: 100%;
    }
</style>