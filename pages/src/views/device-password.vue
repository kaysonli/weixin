<template>
    <form class="full-page">
        <div class="text-field password-field">
            <input type="password" v-model="oldPassword" placeholder="请输入旧密码" v-el:password>
        </div>
        <div class="error" v-show="error.verify">*密码错误</div>
        <div class="text-field password-field">
            <input type="password" v-model="password" placeholder="请输入新密码(四位数字)" v-el:password>
        </div>
        <div class="text-field">
            <input type="password" v-model="password2" placeholder="请重复确认密码" v-el:password2>
        </div>
        <div class="error" v-show="error.unmatch">*两次密码不一致</div>
        <div class="error" v-show="error.password">密码格式不正确</div>
        <div class="page-bottom">
            <div class="button button-revert" @click="submit">完成</div>
        </div>
    </form>
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
            
        }
    },
    data() {
        return {
            oldPassword: '',
            password: '',
            password2: '',
            error: {
                verify: false,
                unmatch: false,
                password: false
            }
        }
    },
    methods: {
        validate() {
            this.error.unmatch = this.password !== this.password2;
            this.error.verify = this.oldPassword !== this.activeDevice.settings.password;
            this.error.password = /^[0-9]{4}$/.test(this.password) === false;
            return !(this.error.verify || this.error.unmatch || this.error.password)
        },
        submit() {
            if(this.validate()) {
                this.$http.post(this.$root.serverUrl + '/settings/changepwd', {
                    devId: this.activeDevice.id,
                    devPwd: this.activeDevice.password,
                    params: this.password
                }).then(function(res) {
                    history.go(-1);
                }, this);
            }
        }
    },
    ready() {
        document.title = '修改设备密码';
    }
}
</script>
<style scoped>
    .password-field {
        margin-top: 15px;
    }
    .button {
        width: 85%;
    }
    .button:active {
        background: #eee;
    }
    .button.fetch:active {
        background: #eac600;
    }
    .button.fetch {
        background: #FEDA00;
        border-radius: 5px;
        height: 35px;
        line-height: 35px;
        width: 150px;
        margin: 0;
        margin-right: 10px;
    }
    .error {
        margin-left: 20px;
        color: red;
    }
    .fa {
        color: #DEDEDE;
    }
</style>