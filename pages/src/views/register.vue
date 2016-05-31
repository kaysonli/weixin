<template>
    <form class="full-page">
        <div class="text-field flex-box">
            <input type="text" placeholder="请输入手机号码" v-model="mobile" class="icon icon-mobile">
            <div class="button fetch" @click="fetch">获取验证码</div>
        </div>
        <div class="error" v-show="error.mobile">*手机号不正确</div>
        <div class="error" v-show="error.existed">*手机号已注册</div>
        <div class="text-field flex-box">
            <input type="text" placeholder="请输入短信验证码" v-model="code" v-el:code class="icon icon-code">
        </div>
        <div class="error" v-show="error.code">*验证码不正确</div>
        <div class="disclaimer">
            <div class="link">*注册即视为我已阅读并同意《软件注册使用协议》</div>
        </div>
        <div class="text-field password-field">
            <input type="password" placeholder="设置密码(6-12位数字或字母)" v-model="password" v-el:password>
        </div>
        <div class="text-field">
            <input type="password" placeholder="请重复确认密码" v-model="password2" v-el:password2>
        </div>
        <div class="error" v-show="error.unmatch">*两次密码不一致</div>
        <div class="error" v-show="error.password">密码格式不正确</div>
        <div class="page-bottom">
            <div class="button button-revert" @click="submit">立即注册</div>
        </div>
    </form>
</template>

<script>
export default {
    data() {
        return {
            mobile: '',
            code: '',
            userName: '',
            password: '',
            password2: '',
            error: {
                mobile: false,
                existed: false,
                code: false,
                unmatch: false,
                password: false
            }
        }
    },
    methods: {
        checkUser(callback) {
            this.$http.get(this.$root.serverUrl + '/checkuser/' + this.mobile).then(function(res) {
                callback(res.data);
            }, this);
        },
        fetch() {
            this.error.mobile = /^1[0-9]{10}$/.test(this.mobile) === false;
            if(this.error.mobile) {
                return;
            }
            this.checkUser(function(exist) {
                this.error.existed = exist;
                if(!exist) {
                    this.$http.post(this.$root.serverUrl + '/sms', {
                        mobile: this.mobile
                    }).then(function(res) {
                        this.verification = res.data.entrySet[0].verification;
                        //{"actionName":"SMS","appId":"Exper","appSecret":"AFDFFDHKDDFJOFFDKLFKFKACMVKKFDFF","status":0,"timeStamp":183727132,"entrySet":[{"mobile":"13760202664","verification":"376274"}],"paramsSet":null}
                    }, this);
                }
            }.bind(this))
        },
        validate() {
            this.error.code = this.code !== this.verification;
            this.error.unmatch = this.password !== this.password2;
            this.error.password = /^[a-zA-Z0-9]{6,12}$/.test(this.password) === false;
            return !(this.error.code || this.error.userName || this.error.unmatch || this.error.password)
        },
        submit() {
            if(!this.validate()) {
                return;
            }
            this.$http.post(this.$root.serverUrl + '/users', {
                username: this.mobile,
                password: this.password
            }).then(function(res) {
                if(res.data.status === 0) {
                    this.$router.go('/login');
                }
                //{"actionName":"AddUserEx","appId":"Exper","appSecret":"AFDFFDHKDDFJOFFDKLFKFKACMVKKFDFF","status":0,"timeStamp":183727132,"entrySet":null,"paramsSet":null}
            }, this);
        }
    }
}
</script>
<style scoped>
    .text-field input:focus {
        border: none;
        -webkit-appearance: none;
    }
    .password-field {
        margin-top: 10px;
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
    .disclaimer {
        padding: 16px;
        background: #fff;
    }
    .link {
        color: #9C9C9C;
    }
    .error {
        margin-left: 20px;
        color: red;
    }
    .fa {
        color: #DEDEDE;
        margin-left: 16px;
    }
</style>