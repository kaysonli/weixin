<template>
  <div class="range-bar">
    <header class="toolbar flex-box">
          <div class="tool" 
              v-touch:tap="onTabChange(0)"
              v-bind:class="{'active': (0 === tabIndex)}">
              <div class="fa fa-pencil"></div>
              <div class="tool-text">范围</div>
          </div>
          <div class="tool" v-touch:tap="onTabChange(1)" v-bind:class="{'active': (1 === tabIndex)}">
              <div class="fa fa-map-signs"></div>
              <div class="tool-text">栅栏</div>
          </div>
    </header>
    <div class="edit-range" v-show="editing">
        <div class="input-field" v-show="tabIndex">
            <input type="number" class="radius" placeholder="请输入数值(最大四位数)" v-el:radius>
            <span>米</span>
        </div>
        <div class="ok" v-touch:tap="onOK">确定</div>
        <span class="cancel" v-touch:tap="onCancel">取消</span>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      tabIndex: 0,
      editing: false
    }
  },
  methods: {
    onTabChange(index) {
      this.tabIndex = index;
      if(!this.editing) {
        this.editing = true;
        if(index === 0) {
          this.$dispatch('draw-start');
        }
      }
    },
    onOK() {
        this.editing = false;
        if(this.tabIndex === 0) {
            this.$dispatch('draw-complete');
        } else {
          this.$dispatch('set-radius', this.$els.radius.value);
        }
    },
    onCancel() {
        this.editing = false;
        if(this.tabIndex === 0) {
            this.$dispatch('draw-cancel');
        }
    },
  }
}
</script>
<style type="text/css" scoped>
  .range-bar {
    position: fixed;
    width: 100%;
    background: #fff;
    z-index: 10;
  }
  .toolbar {
    height: 50px;
    align-items: center;
    justify-content: space-around;
    z-index: 1;
  }
  .active,
  .edit-range {
    background: #FEDA00;
  }
  .edit-range {
    background: #FEDA00;
    height: 55px;
    position: absolute;
    top: 50px;
    z-index: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  .tool {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
  }
  .tool .fa {
      color: #FEDA00;
      font-size: 18px;
      margin-right: 10px;
  }
  .tool.active .fa {
    color: #fff;
  }
  .tool-text {
      font-size: 14px;
  }
  .input-field {
      background: #fff;
      padding: 5px;
      border-radius: 3px;
  }
  .input-field span {
      margin-right: 10px;
  }
  .radius {
      height: 20px;
      border: none;
      outline: 0;
  }
  .radius:after {
      content: '米';
      position: relative;
      right: 20px;
  }
  .ok {
    background: #fff;
    padding: 6px;
    width: 45px;
    text-align: center;
    border-radius: 3px;
}
</style>