<template>
    <div class="full-page content" @touchstart.prevent="">
      <header class="date-header range-header">
        <span class="date header-icon"></span>
        <span>日期</span>
      </header>
      <div class="picker">
        <scroller v-ref:year :items="years" :ticks="3"></scroller>
        <scroller v-ref:month :items="months" :ticks="3"></scroller>
        <scroller v-ref:date :items="dates" :ticks="3"></scroller>
      </div>
      <div class="flex-box">
        <div class="time-header range-header">
          <span class="time-start header-icon"></span>
          <span>开始时间</span>
        </div>
        <div class="time-header range-header">
          <span class="time-end header-icon"></span>
          <span>结束时间</span>
        </div>
      </div>
      <div class="picker">
        <scroller v-ref:starthour :items="hours" :ticks="3" class="hour-scroller"></scroller>
        <scroller v-ref:startmin :items="minutes" :ticks="3"></scroller>
        <scroller v-ref:endhour :items="hours" :ticks="3" class="hour-scroller"></scroller>
        <scroller v-ref:endmin :items="minutes" :ticks="3"></scroller>
      </div>
      <div class="button" v-touch:tap="onOK">确定</div>
    </div>
</template>

<script>
import Scroller from './../components/scroller.vue';
export default {
  components: {
    Scroller
  },
  data() {
    return {
      year: 2016,
      month: 5,
      date: 21,
      hourFrom: 8,
      minFrom: 0,
      hourTo: 23,
      minTo: 59
    }
  },
  computed: {
    years() {
      var today = new Date();
      var items = [];
      var year = today.getFullYear();
      for (var i = 5; i >= 0; i--) {
        items.push({
          value: year - i,
          text: (year - i) + ' 年'
        });
      }
      return items;
    },
    months() {
      var items = [];
      for (var i = 11; i >= 0; i--) {
        items.push({
          value: 12 - i,
          text: (12 - i) + ' 月'
        });
      }
      return items;
    },
    dates() {
      var year = this.$refs.year.value;
      var month = this.$refs.month.value;
      var leapYear = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
      var daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var days = daysInMonth[month - 1];
      var items = [];
      for (var i = days - 1; i >= 0; i--) {
        items.push({
          value: days - i,
          text: (days - i) + ' 日'
        });
      }
      // console.log('date: ', this.$refs.date.value);
      return items;
    },
    hours() {
      var items = [];
      for (var i = 23; i >= 0; i--) {
        items.push({
          value: 23 - i,
          text: ("00" + (23 - i)).slice(-2)
        });
      }
      return items;
    },
    minutes() {
      var items = [];
      for (var i = 59; i >= 0; i--) {
        items.push({
          value: 59 - i,
          text: ("00" + (59 - i)).slice(-2)
        });
      }
      return items;
    }
  },
  methods: {
    getTimeRange() {
      var year = this.$refs.year.value,
        month = this.$refs.month.value,
        date = this.$refs.date.value,
        starthour = this.$refs.starthour.value,
        startmin = this.$refs.startmin.value,
        endhour = this.$refs.endhour.value,
        endmin = this.$refs.endmin.value;
      var from, end;
      var dateObj = new Date(year, month - 1, date);
      dateObj.setHours(starthour);
      dateObj.setMinutes(startmin);
      from = +dateObj;
      dateObj.setHours(endhour);
      dateObj.setMinutes(endmin);
      to = +dateObj;
      return {
        from: from,
        to: to
      };
    },
    onOK() {
      var range = this.getTimeRange();
      this.$dispatch('timerange', range);
      // console.log(this.$refs.year.value, this.$refs.month.value, this.$refs.date.value);
    }
  },
  ready() {
    var today = new Date();
    this.year = today.getFullYear();
    this.month = today.getMonth() + 1;
    this.date = today.getDate();
    this.$refs.year.value = this.year;
    this.$refs.month.value = this.month;
    this.$refs.date.value = this.date;
    this.$refs.starthour.value = this.hourFrom;
    this.$refs.startmin.value = this.minFrom;
    this.$refs.endhour.value = this.hourTo;
    this.$refs.endmin.value = this.minTo;
  }
}
</script>
<style>
  .content {
    background: #F0F0F0;
    z-index: 10000;
  }
  .picker {
    display: flex;
  }
  .range-header {
    height: 55px;
    line-height: 55px;
    font-size: 14px;
    text-align: center;
    font-weight: bold;
  }
  .date {
    background: url(/resources/images/data_icon_01.png) no-repeat center center / 100% auto;
  }
  .header-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }

  .time-start,
  .time-end {
    background: url(/resources/images/data_icon_02.png) no-repeat center center / 100% auto;
  }
  .flex-box {
    justify-content: space-around;
  }
  .time-header {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .date-header {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hour-scroller .scroller-indicator:after {
    content: ':';
    position: absolute;
    right: 0;
    top: 5px;
    font-weight: bold;
  }
  .picker,
  .range-header {
  	border-bottom: 1px solid gray;
  }
</style>