<template>
  <div class="scroller-component" v-bind:style="{height: height + 'px'}">
    <div class="scroller-mask" data-role="mask" 
      v-bind:style="{backgroundSize: '100% ' + indicatorTop + 'px'}"
      @touchstart="onTouchStart" 
      @touchmove.prevent="onTouchMove" 
      @touchend="onTouchEnd"></div>
    <div class="scroller-indicator" data-role="indicator"
     v-bind:style="{height: itemHeight + 'px', top: indicatorTop + 'px'}"></div>
    <div class="scroller-content" v-bind:style="{ transform: 'translate3D(0, ' + top + 'px, 0)' }">
      <div class="scroller-item" 
        v-bind:class="{'scroller-item-selected': (item.value === value)}"
        v-bind:style="{height: itemHeight + 'px'}"
        v-for="item in items" data-value="{{ item.value }}">{{ item.text }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default() { return [] },
    },
    value: {
      twoWay: true
    },
    ticks: {
      type: Number,
      default() {
        return 5;
      }
    },
    itemHeight: {
      type: Number,
      default() {
        return 34;
      }
    }
  },
  data () {
    return {
      top: 0
    }
  },
  computed: {
    height() {
      return this.itemHeight * this.ticks;
    },
    indicatorTop() {
      return (this.ticks - 1) / 2 * this.itemHeight;
    }
  },
  watch: {
    'value': function(val, oldVal) {
      var index = -1;
      for(var i = 0; i < this.items.length; i++) {
        if(this.items[i].value === val) {
          index = i;
          break;
        }
      }
      var unit = this.itemHeight;
      var start = (this.ticks - 1) / 2;
      if(index > -1) {
        this.top = (start - index) * unit;
      }
    },
    'items': function(val, oldVal) {
      var index = -1;
      for(var i = 0; i < val.length; i++) {
        if(val[i].value === this.value) {
          index = i;
          break;
        }
      }
      if(index < 0) {
        this.value = val[val.length - 1].value;
      }
    }
  },
  methods: {
    onTouchStart(evt) {
      this.lastY = evt.touches[0].clientY;
    },
    onTouchMove(evt) {
      var unit = this.itemHeight;
      var middle = (this.ticks - 1) / 2;
      var max = unit * middle;
      var min = max - (this.items.length - 1) * unit;
      var y = evt.touches[0].clientY;
      var offset = y - this.lastY;
      this.lastY = y;
      if(offset > 0) {
        if(this.top + offset < max) {
          this.top += offset;
        }
      } else {
        if(this.top + offset > min) {
          this.top += offset;
        }
      }
    },
    onTouchEnd(evt) {
      var unit = this.itemHeight;
      var middle = (this.ticks - 1) / 2;
      var zero = unit * middle;
      var m = Math.round(this.top / unit);
      this.top = m * unit;
      console.log('top', this.top);
      this.value = this.items[(zero - this.top) / unit].value;
    }
  }
}
</script>
<style>
  .scroller-component {
    display: block;
    position: relative;
    height: 238px;
    width: 100%;
    overflow: hidden;
  }
  .scroller-item {
    line-clamp: 1;
    -webkit-line-clamp: 1;
    overflow: hidden;
    text-overflow: ellipsis
  }

  .scroller-content {
      z-index: 1
  }

  .scroller-content,.scroller-mask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
  }
  .scroller-mask {
    height: 100%;
    margin: 0 auto;
    z-index: 3;
    background-image: -webkit-linear-gradient(top,hsla(0,0%,100%,.95),hsla(0,0%,100%,.6)),-webkit-linear-gradient(bottom,hsla(0,0%,100%,.95),hsla(0,0%,100%,.6));
    background-image: linear-gradient(180deg,hsla(0,0%,100%,.95),hsla(0,0%,100%,.6)),linear-gradient(0deg,hsla(0,0%,100%,.95),hsla(0,0%,100%,.6));
    background-position: top,bottom;
    background-size: 100% 102px;
    background-repeat: no-repeat;
    background: none;
}

.scroller-item {
    text-align: center;
    font-size: 16px;
    height: 34px;
    line-height: 34px;
    color: #000
}

.scroller-indicator {
    width: 100%;
    height: 34px;
    position: absolute;
    left: 0;
    top: 102px;
    z-index: 3;
    background-image: -webkit-linear-gradient(top,#d0d0d0,#d0d0d0,transparent,transparent),-webkit-linear-gradient(bottom,#d0d0d0,#d0d0d0,transparent,transparent);
    background-image: linear-gradient(180deg,#d0d0d0,#d0d0d0,transparent,transparent),linear-gradient(0deg,#d0d0d0,#d0d0d0,transparent,transparent);
    background-position: top,bottom;
    background-size: 100% 1px;
    background-repeat: no-repeat;
    background: #fff;
    z-index: -1;
}
</style>
