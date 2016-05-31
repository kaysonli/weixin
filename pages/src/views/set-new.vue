<template>
    <form class="full-page">
        <div class="text-field password-field">
            <input type="password" v-model="password" placeholder="请输入密码" v-el:password>
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
    route: {
        data(transition) {
            if(transition.from.path === '/reset' && this.$root.verified) {
                transition.next();
            } else {
                transition.abort();
            }
        }
    },
    data() {
        return {
            password: '',
            password2: '',
            error: {
                unmatch: false,
                password: false
            }
        }
    },
    methods: {
        validate() {
            this.error.unmatch = this.password !== this.password2;
            this.error.password = /^[a-zA-Z0-9]{6,12}$/.test(this.password) === false;
            return !(this.error.unmatch || this.error.password)
        },
        submit() {
            if(this.validate()) {
                this.$http.post(this.$root.serverUrl + '/users/resetpwd', {
                    mobile: this.$route.params.mobile,
                    password: this.password
                }).then(function(res) {
                    this.$router.go('/login');
                }, this);
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
    }
</style>