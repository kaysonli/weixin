<template>
    <form class="full-page">
        <div class="text-field flex-box">
            <i class="fa fa-mobile"></i>
            <input type="text" v-model="mobile" placeholder="请输入手机号码" class="icon-mobile icon">
            <div class="button fetch" @click="fetch">{{ btnText }}</div>
        </div>
        <div class="error" v-show="error.notexisted">*用户不存在</div>
        <div class="error" v-show="error.mobile">*手机号不正确</div>
        <div class="text-field flex-box">
            <i class="fa fa-commenting"></i>
            <input type="text" v-model="code" placeholder="请输入短信验证码" class="icon icon-code" v-el:code>
        </div>
        <div class="error" v-show="error.code">*验证码不正确</div>
        <div class="page-bottom">
            <div class="button button-revert" @click="next">下一步</div>
        </div>
    </form>
</template>

<script>
export default {
    route: {
        data(transition) {
            transition.next();
        },
        deactivate() {
            this.$root.verified = false;
        }
    },
    data() {
        return {
            mobile: '',
            code: '',
            error: {
                notexisted: false,
                mobile: false,
                code: false
            },
            btnText: '获取验证码',
            btnDisabled: false
        }
    },
    methods: {
        checkUser(callback) {
            this.$http.get(this.$root.serverUrl + '/checkuser/' + this.mobile).then(function(res) {
                callback(res.data);
            }, this);
        },
        countDown() {
            this.btnDisabled = true;
            var time = 60;
            this.btnText = time + 's';
            var timer = setInterval(function() {
                --time;
                this.btnText = time + 's';
                if(time <= 0) {
                    clearInterval(timer);
                    this.btnText = '获取验证码';
                    this.btnDisabled = false;
                }
            }.bind(this), 1000);
        },
        fetch() {
            if(this.btnDisabled) {
                return;
            }
            this.error.mobile = /^1[0-9]{10}$/.test(this.mobile) === false;
            if(this.error.mobile) {
                return;
            }
            this.countDown();
            this.checkUser(function(exist) {
                this.error.notexisted = !exist;
                if(exist) {
                    this.$http.post(this.$root.serverUrl + '/sms', {
                        mobile: this.mobile
                    }).then(function(res) {
                        this.verification = res.data.entrySet && res.data.entrySet[0].verification;
                        //{"actionName":"SMS","appId":"Exper","appSecret":"AFDFFDHKDDFJOFFDKLFKFKACMVKKFDFF","status":0,"timeStamp":183727132,"entrySet":[{"mobile":"13760202664","verification":"376274"}],"paramsSet":null}
                    }, this);
                }
            }.bind(this))
        },
        validate() {
            this.error.code = this.code !== this.verification;
            return this.code === this.verification;
        },
        next() {
            if(this.validate()) {
                this.$root.verified = true;
                this.$router.go({
                    path: '/reset/' + this.mobile
                });
            }
        }
    },
    ready() {
        document.title = '找回密码';
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
        margin-left: 16px;
        display: none;
    }
</style>