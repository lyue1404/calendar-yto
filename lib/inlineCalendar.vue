<template>
  <div class="m-calendar" ref="calendar">
    <!-- calendar title when collapse -->
    <div class='calendar-title pal10p' v-if='ifcollapse'>
      <div class="divider">
        <span class='date medium'>{{showDateInfo.date}}</span>
        <div>
          <div class='month medium'>/ {{showDateInfo.month}}</div>
          <div class='day'>星期{{showDateInfo.day}} {{selDateLunarInfo.lunarMonthName}}{{selDateLunarInfo.lunarDayName}}</div>
        </div>
      </div>
      <span class='festival'>{{ytoHoliday}} {{selDateLunarInfo.solarFestival || selDateLunarInfo.lunarFestival}}</span>
    </div>
    <div class="m-week-header">
      <div
        class="m-week-day"
        v-for="item in weekNames"
        :key="item"
      >
        {{item}}
      </div>
    </div>
    <div
      class="m-months-container"
      :class="{'collapse': ifcollapse}"
      @touchstart="touchstart"
      @touchmove="touchmove"
      @touchend="touchend"
    >
      <div
        class="m-months-wrapper"
        :style="{'transform': `translate3d(${-translateX*100}%, 0, 0)`}"
      >
        <div
          class="m-months"
          v-for="(month,monthIndex) in fullDate"
          :key="monthIndex"
          :style="{
            transform: `translate3d(${(monthIndex-1+translateX + (isTouching ? touch.x : 0))*100}%, 0, 0)`,
            transitionDuration: isTouching ? '0s' : '.3s',
          }"
        >
          <div
            class="m-row"
            v-for="(week,weekIndex) in month"
            :key="weekIndex"
            :style="{'display': ifShowTheWeek(weekIndex) ? 'flex':'none'}"
          >
            <div
              class="m-day"
              v-for="(day,dayIndex) in week"
              :key="dayIndex"
              @click="onDayClick(day,weekIndex)"
            >
              <span
                :class="{
                  'medium': true,
                  'm-day-num':true,
                  'm-grey': day.isGrey,
                  'm-today': day.isToday,
                  'm-disable': day.isDisable,
                  'm-select': day.isSelect,
                  'm-during': day.isDuring
                }"
              >
                {{day.value}}
              </span>
              <slot name="day" :date="day" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="m-toolbar pal10p" :style="{ 'display' : ifcollapse ? 'none' : 'flex' }">
      <button class='return-to-toady medium' @click='returnToToday'>返回当月</button>
      <div class="m-month-selector medium">
        <a @click="changeMonth('prev')">
          <svg-icon icon-class="month_left" class="svg-icon pointer"></svg-icon>
        </a>
        <span class='year'>{{showDate.year}}</span>
        -
        <span class="month">{{monthNames[showDate.month-1]}}</span>
        <a  @click="changeMonth('next')">
          <svg-icon icon-class="month_right" class="svg-icon pointer" ></svg-icon>
        </a>
      </div>
    </div>
    <div class='collapse'>
      <a class='return-to-toady' @click='toggleCollapse'>
        <svg-icon icon-class="arrow_up" class="svg-icon pointer" v-if='!ifcollapse'></svg-icon>
        <svg-icon icon-class="arrow_down" class="svg-icon pointer" v-if='ifcollapse'></svg-icon>
      </a>
    </div>
    
  </div>
</template>
<script>
import './inlineCalendar.less';
import dayjs from 'dayjs';
import { getTheHoliday } from '../src/api/calendar.js';
let touchStartPosition;
let touchEndPosition;
let timeStamp;

export default {
  name: 'inlineCalendar',
  props: {
    defaultDate: {
      type: [Date, Number, Array, String, dayjs],
    },
    disabledDate: {
      type: Array,
      default() {
        return [];
      },
    },
    minDate: {
      type: [Date, Number, Array, String, dayjs],
    },
    maxDate: {
      type: [Date, Number, Array, String, dayjs],
    },
    mode: {
      type: String,
      default: 'single',
    },
    dayClick: {
      type: Function,
      default() {
        return function() {
          return true;
        };
      },
    },
    enableTouch: {
      type: Boolean,
      default: true,
    },
    monthNames: {
      type: Array,
      default() {
        return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      },
    },
    weekNames: {
      type: Array,
      default() {
        return ['一', '二', '三', '四', '五', '六', '日'];
      },
    },
    yearName: {
      type: String,
      default: '年',
    },
    restrictCurrentMonth: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    mode() {
      this.init();
    },
  },
  data() {
    return {
      fullDate: [[], [], []],
      translateX: 0,
      showDate: {
        year: undefined,
        month: undefined,
      },
      dateNow: {
        year: dayjs().year(),
        month: dayjs().month() + 1,
        date: dayjs().date(),
      },
      selectDate: [],
      touch: {
        x: 0,
        y: 0,
      },
      isTouching: false,
      ifcollapse: false,
      selIndex: '',
      currentIndex: '',
      selDateLunarInfo: {},
      showDateInfo: {},
      ytoHoliday: ''
    };
  },
  created() {
    this.init();
  },
  methods: {
    ifShowTheWeek(weekIndex) {
      if(!this.ifcollapse) {
        return true;
      }
      if(this.selIndex !== '' ) {
        return weekIndex == this.selIndex; 
      }
      return weekIndex == this.currentIndex;
    },
    init(date) {
      this.selectDate = [];
      let { defaultDate, mode } = this;
      if (date) {
        defaultDate = date;
      }
      let dateToShow = dayjs().startOf('month');
      if (mode === 'single' && defaultDate) {
        this.selectDate = dayjs(defaultDate).startOf('day');
        dateToShow = this.selectDate.startOf('month');
      }
      if (mode === 'multiple' && Array.isArray(defaultDate)) {
        if (defaultDate.length > 0) {
          this.selectDate = defaultDate.map((item) => dayjs(item).startOf('day'));
        }
      }
      if (mode === 'during' && Array.isArray(defaultDate)) {
        if (defaultDate.length === 2) {
          const startDate = dayjs(defaultDate[0]).startOf('day');
          const endDate = dayjs(defaultDate[1]).startOf('day');
          if (startDate.isBefore(endDate) || startDate.isSame(endDate)) {
            this.selectDate = [startDate, endDate];
          }
        }
      }
      this.showDate = {
        year: dateToShow.year(),
        month: dateToShow.month() + 1,
      };
      this.getFullDate(this.showDate);
      this.getSelectedDateInfo();
    },
    
    touchstart(event) {
      if (this.enableTouch) {
        touchStartPosition = event.touches[0].clientX;
        touchEndPosition = event.touches[0].clientY;
        timeStamp = event.timeStamp;
        this.touch = {
          x: 0,
          y: 0,
        };
        this.isTouching = true;
      }
    },
    touchmove(event) {
      if (this.enableTouch) {
        this.touch = {
          x: (event.touches[0].clientX - touchStartPosition) / this.$refs.calendar.offsetWidth,
          y: (event.touches[0].clientY - touchEndPosition) / this.$refs.calendar.offsetHeight,
        };
      }
    },
    touchend(event) {
      if (this.enableTouch) {
        this.isTouching = false;
        const during = dayjs(event.timeStamp).diff(timeStamp);
        if (Math.abs(this.touch.x) > Math.abs(this.touch.y) && Math.abs(this.touch.x * this.$refs.calendar.offsetWidth) > 20) {
          if (this.touch.x > 0) {
            this.changeMonth('prev');
          } else if (this.touch.x < 0) {
            this.changeMonth('next');
          }
        } else {
          this.touch = {
            x: 0,
            y: 0,
          };
        }
      }
    },
    // 触发change事件
    emitChange() {
      this.$emit('change', this.selectDate);
    },
    // 触发切换年月事件
    emitSwitch(showDate) {
      if (this.restrictCurrentMonth) {
        this.selectDate = [];
      }
      this.$emit('switch', showDate);
    },
    emitCollapseState() {
      this.$emit('collapse',this.ifcollapse);
    },
    // 日期点击事件
    onDayClick(day,weekIndex) {
      if (!this.dayClick(day.dateTime)) {
        return;
      }
      this.selIndex = weekIndex;
      switch (this.$props.mode) {
      case 'single':
        if (!day.isSelect && !day.isDisable) {
          this.selectDate = day.dateTime;
          this.getFullDate(this.showDate);
          this.emitChange();
          this.getSelectedDateInfo();
        }
        break;
      case 'multiple':
        if (!day.isSelect && !day.isDisable) {
          this.selectDate.push(day.dateTime);
          this.getFullDate(this.showDate);
          this.emitChange();
        } else {
          if (this.selectDate.length > 1) {
            this.selectDate = this.selectDate.filter((item) => !item.isSame(day.dateTime));
            this.getFullDate(this.showDate);
            this.emitChange();
          }
        }
        break;
      case 'during':
        if (day.isDisable) return;
        if (this.restrictCurrentMonth && day.isGrey) return;
        if (this.selectDate.length === 0) {
          this.selectDate = [day.dateTime];
        } else if (this.selectDate.length === 1) {
          this.selectDate.push(day.dateTime);
          if (this.selectDate[1].isBefore(this.selectDate[0])) {
            this.selectDate.reverse();
          }
        } else if (this.selectDate.length === 2) {
          this.selectDate = [day.dateTime];
        }
        this.getFullDate(this.showDate);
        this.emitChange();
        break;
      }
    },
    // 切换年份
    changeYear(action) {
      const date = dayjs(`${this.showDate.year}-${this.showDate.month}`);
      let computedDate;
      switch (action) {
      case 'prev':
        this.translateX += 1;
        computedDate = date.subtract(1, 'year');
        break;
      case 'next':
        this.translateX -= 1;
        computedDate = date.add(1, 'year');
        break;
      }
      this.showDate = {
        year: computedDate.year(),
        month: computedDate.month() + 1,
      };
      this.emitSwitch(this.showDate);
      this.getFullDate(this.showDate);
    },
    // 切换月份
    changeMonth(action) {
      const date = dayjs(`${this.showDate.year}-${this.showDate.month}`);
      let computedDate;
      switch (action) {
      case 'prev':
        this.translateX += 1;
        computedDate = date.subtract(1, 'month');
        break;
      case 'next':
        this.translateX -= 1;
        computedDate = date.add(1, 'month');
        break;
      }
      this.showDate = {
        year: computedDate.year(),
        month: computedDate.month() + 1,
      };
      this.emitSwitch(this.showDate);
      this.getFullDate(this.showDate);
    },
    // 暴露出去的方法：切换已选的时间
    changeDate(date) {
      if (dayjs(date).isValid() || Array.isArray(date)) {
        this.init(date);
      } else {
        console.error('Type of parameter is invalid!');
      }
    },
    // 暴露出去的方法：切换当前显示的时间
    changeDateView(date = dayjs()) {
      const changeDate = dayjs(date);
      this.showDate = {
        year: changeDate.year(),
        month: changeDate.month() + 1,
      };
      this.getFullDate(this.showDate);
    },
    getFullDate() {
      const date = dayjs(`${this.showDate.year}-${this.showDate.month}`);
      const thisDate = this.getDate(date,true);
      const prevDate = this.getDate(date.subtract(1, 'month'));
      const nextDate = this.getDate(date.add(1, 'month'));
      this.fullDate = [
        prevDate.fullDate,
        thisDate.fullDate,
        nextDate.fullDate,
      ];
    },
    // 当前日期是否被选中
    isSelect(date) {
      let select = false;
      switch (this.$props.mode) {
      case 'single':
        if (this.selectDate && date.isSame(this.selectDate)) {
          select = true;
        }
        break;
      case 'multiple':
        if (this.selectDate.length > 0 && this.selectDate.some((item) => date.isSame(item))) {
          select = true;
        }
        break;
      }
      return select;
    },
    // 当前时间是否在selectDate之间
    isBetting(date) {
      if (this.mode === 'during') {
        const startDate = this.selectDate[0];
        const endDate = this.selectDate[1];
        if (this.selectDate.length === 1) {
          return date.isSame(startDate);
        } else if (this.selectDate.length === 2) {
          return (date.isAfter(startDate) && date.isBefore(endDate)) || date.isSame(startDate) || date.isSame(endDate);
        }
      }
      return false;
    },
    getIsDisable(dateTime) {
      let isDisable = false;
      const disabledDate = this.disabledDate.map((item) => dayjs(item).startOf('day'));
      if (this.minDate || this.maxDate) {
        if (this.minDate) {
          const minDate = dayjs(this.minDate).startOf('day');
          isDisable = dateTime.isBefore(minDate);
        }
        if (!isDisable && this.maxDate) {
          const maxDate = dayjs(this.maxDate).endOf('day');
          isDisable = dateTime.isAfter(maxDate);
        }
      } else if (disabledDate.length > 0) {
        if (this.mode !== 'during') {
          isDisable = disabledDate.some((item) => item.isSame(dateTime));
        }
      }
      return isDisable;
    },
    getDate(thisDate,ifCurrent = false) {
      let date = [];
      const prevDate = thisDate.subtract(1, 'month');
      const nextDate = thisDate.add(1, 'month');
      const firstDayOfWeek = thisDate.day() || 7;
      const dayCountOfThisMonth = thisDate.daysInMonth();
      const dayCountOfPrevMonth = prevDate.daysInMonth();
      const prevIndexOfThisMonth = firstDayOfWeek - 1;
      const NextIndexOfThisMonth = firstDayOfWeek + dayCountOfThisMonth - 2;
      const disabledDate = this.disabledDate.map((item) => dayjs(item).startOf('day'));
      for (let i = 0; i < 7 * 6; i++) {
        // 上月
        if (i < prevIndexOfThisMonth) {
          const value = dayCountOfPrevMonth - (firstDayOfWeek - i - 2);
          const dateTime = prevDate.date(value);
          const dateStr = `${dateTime.$y}-${String(dateTime.$M+1).padStart(2,0)}-${String(dateTime.$D).padStart(2,0)}`;
          date[i] = {
            value,
            dateTime,
            isGrey: true,
            isToday: dateTime.isSame(dayjs().startOf('day')),
            isSelect: this.isSelect(dateTime),
            isDisable: this.getIsDisable(dateTime),
            isDuring: this.isBetting(dateTime),
            dateStr
          };
        }
        // 当月
        if (
          i >= prevIndexOfThisMonth &&
          i <= NextIndexOfThisMonth
        ) {
          const value = i - firstDayOfWeek + 2;
          const dateTime = thisDate.date(value);
          const dateStr = `${dateTime.$y}-${String(dateTime.$M+1).padStart(2,0)}-${String(dateTime.$D).padStart(2,0)}`;
          date[i] = {
            value,
            dateTime,
            isGrey: false,
            isToday: dateTime.isSame(dayjs().startOf('day')),
            isSelect: this.isSelect(dateTime),
            isDisable: this.getIsDisable(dateTime),
            isDuring: this.isBetting(dateTime),
            dateStr
          };
        }
        // 下月
        if (i > NextIndexOfThisMonth) {
          const value = i - firstDayOfWeek - dayCountOfThisMonth + 2;
          const dateTime = nextDate.date(value);
          const dateStr = `${dateTime.$y}-${String(dateTime.$M+1).padStart(2,0)}-${String(dateTime.$D).padStart(2,0)}`;
          date[i] = {
            value,
            dateTime,
            isGrey: true,
            isToday: dateTime.isSame(dayjs().startOf('day')),
            isSelect: this.isSelect(dateTime),
            isDisable: this.getIsDisable(dateTime),
            isDuring: this.isBetting(dateTime),
            dateStr
          };
        }
      }
      const fullDate = [];
      for (let i = 0; i < 6; i++) {
        let weekArr = date.slice(i * 7, (i + 1) * 7);
        for (let j = 0; j < weekArr.length; j++) {
          if (weekArr[j].isToday) {
            this.currentIndex = i;
          }
        }
        fullDate.push(date.slice(i * 7, (i + 1) * 7));
      }
      if(ifCurrent) {
          this.$emit('dateDuring',{ startDate: fullDate[0][0].dateStr, endDate: fullDate[5][6].dateStr});
      }
      return {
        fullDate,
      };
    },
    returnToToday() {
      this.changeDate(`${dayjs().year()}-${dayjs().month()+1}-${dayjs().date()}`);
      this.selIndex = '';
      this.emitChange();
    },
    toggleCollapse() { 
      if(!this.ifcollapse) {
        this.getCollapseDatesInfo();
      } 
      this.ifcollapse = !this.ifcollapse;
      this.emitCollapseState();
    },
    getCollapseDatesInfo() {
      if(!Object.keys(this.selectDate).length) {
        this.changeDateView(`${dayjs().year()}-${dayjs().month()+1}`);
        return;
      }
      if(this.showDate.year != this.selectDate.$y || this.showDate.month != this.selectDate.$M) {
        this.changeDateView(`${this.selectDate.$y}-${this.selectDate.$M+1}`);
      }
    },
    getSelectedDateInfo() {
      let titleDate; 
      if(Object.keys(this.selectDate).length) {
        this.showDateInfo = {
          month: this.selectDate.$M + 1,
          date: this.selectDate.$D,
          day: this.weekNames[this.selectDate.$W-1],
        };
        titleDate = {
          y : this.selectDate.$y,
          m: this.selectDate.$M + 1,
          d:this.selectDate.$D
        };
      }else{
        this.showDateInfo = {
          month: dayjs().month() + 1,
          date: dayjs().date(),
          day: this.weekNames[dayjs().day()],
        };
        titleDate = {
          y : dayjs().year(),
          m: dayjs().month() + 1,
          d: dayjs().date()
        };
      }
      this.selDateLunarInfo = LunarCalendar.solarToLunar(titleDate.y, titleDate.m, titleDate.d);
      getTheHoliday(`${titleDate.y}-${titleDate.m}-${titleDate.d}`).then(res => {
        if(res.status == 0) {
            if(res.data.holList && res.data.holList.length) {
              let holidays = [];
              res.data.holList.forEach(holiday => {
                holidays.push(holiday.holidayName)
              })
              this.ytoHoliday = holidays.join(' ');
            }else{
              this.ytoHoliday = '';
            } 
        }else{
          this.$vux.toast.show({
              time: 3000,
              type:'warn',
              width:'80vw',
              text: res.message,
              position: 'middle'
          });
        }
      })
      
    }
  },
};
</script>
