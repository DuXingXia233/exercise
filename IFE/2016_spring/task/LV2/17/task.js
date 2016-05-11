// ----- common.js ----- //
function addEvent(el, type, callback, bubb) {
  el.addEventListener ? el.addEventListener(type, callback, bubb || false) : el.attachEvent.call(el, type, callback);
}


/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date("2016-01-01");
  var datStr = '';
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};





function App(config) {

  this.config = config;

  // 用于渲染图表的数据
  this.chartData = {};

  // 记录当前页面的表单选项
  this.pageState = {
    nowSelectCity: -1,
    nowGraTime: "day"
  };

  this.init();
}
App.prototype = {

  /**
   * 渲染图表
   */
  renderChart: function() {
      
    var that = this,
        state = that.pageState,
        data = that.chartData[state.nowSelectCity][state.nowGraTime],
        titles = that.chartData[state.nowSelectCity].titles[state.nowGraTime],
        classname = that.chartClass[state.nowGraTime],
        tempDOM = document.createDocumentFragment(),
        parent = that.target,
        child,
        i, len;

        

    function setColor() {

      function randomColor() {
        var color = ((Math.random() * 0xFFFFFF) >> 0).toString(16) + "";
        color = "#00000".slice(0, 7-color.length) + color;

        return color;
      }

      return randomColor();
    }

    parent.innerHTML = "";

    for (i=0, len = data.length; i <len; i++) {
      if(isNaN(data[i])) {
        continue;
      }
      child = document.createElement("div");
      child.className = classname;

      child.style.height = data[i] + "px";
      child.style.backgroundColor = setColor();
      child.title = titles[i] + " "+ (data[i] >> 0); 
      tempDOM.appendChild(child);
    }

    parent.appendChild(tempDOM);
  },

  /**
   * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
   */
  initGraTimeForm: function() {
    var that = this,
        parent = that.el.querySelector(that.radioParent),
        radioName = that.radioName,
        curValue;

        /**
         * 日、周、月的radio事件点击时的处理函数
         */
        function graTimeChange() {
          // 确定是否选项发生了变化 
          // 设置对应数据
          // 调用图表渲染函数
          
          
          if (curValue != that.pageState.nowGraTime) {
            that.pageState.nowGraTime = curValue;
            that.renderChart();
          } 
        }

        addEvent(parent, "click", function(event) {
          var target;

          event = event || window.event;
          target = event.target || event.srcElement;

          if (target.name === radioName) {
            curValue = target.value;
            graTimeChange();
          }
        });


  },

  /**
   * 初始化城市Select下拉选择框中的选项
   */
  initCitySelector: function() {
      var that = this,
          data = that.data,
          selection = that.el.querySelector(that.singleSelection),
          name, newOption,
          curValue;

      selection.style.display = "none";

      (function clearOptions(selection) {
        var len = selection.options.length;

        for (var i=0; i<len; i++) {
          selection.remove(0);
        }
      })(selection);

     // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
      for (name in data) {
        newOption = document.createElement("option");
        newOption.value = name;
        newOption.text = name;
        selection.add(newOption, null);
      }
      that.pageState.nowSelectCity = selection.value;
      selection.style.display = "";

      /**
       * select发生变化时的处理函数
       */
      function citySelectChange() {

        curValue = this.value;
        // 确定是否选项发生了变化 
        if (curValue != that.pageState.nowSelectCity) {
        
        // 设置对应数据
        that.pageState.nowSelectCity = curValue;
        // 调用图表渲染函数
        that.renderChart();
        }
      }

     // 给select设置事件，当选项发生变化时调用函数citySelectChange
      addEvent(selection, "change", citySelectChange);

  },

  /**
   * 初始化图表需要的数据格式
   */
  initAqiChartData: function() {
    // 将原始的源数据处理成图表需要的数据格式
    // 处理好的数据存到 chartData 中
    var orginData = this.data,
        storeData,
        titles,
        name, record,
        tempArray,
        day, data, week, month, year,
        datas, weeks, months,
        weekday;

    var JAN = 0, WEEKEND = 7,
        m, d, monthLen, weekLen, dataLen;

    function average(Len) {
      var totall = datas.slice(-Len).reduce(function(per, cur) {
                                                  return per + cur;
                                                }, 0);
      return totall / Len;
      
    }

    function fixDate(num) {
      num  = num.length == 1 ? ("0"+num) : num; 
      return num;
    }
    // ---- 遍历cityName
    for ( name in orginData) {
      titles = {};
      storeData = {};
      datas = [];
      weeks = [];
      months = [];
      titles.day = [];
      titles.week = [];
      titles.month = [];
      data = 0;
      month = 0;

      
      // 数据 索引化
      for (record in orginData[name]) {
        tempArray = record.split("-");

        data = tempArray[2]-0;
        month = tempArray[1]-1;
        year = tempArray[0]-0;

        if ( !(Object.prototype.toString.call(months[month]) === "[object Array]")) {
          months[month] = [];
        }

        months[month][data-1] = orginData[name][record];

        
      }

      // ---- 只考虑月份缺省，但每月的数据是足日的 ----- //
      for (m = JAN, monthLen = months.length; m <monthLen; m++) {
        
        if (!months[m]) {
          continue;
        } 

        week = 0;
        
        
        day = new Date(year, m, 1);
        // ----- 确定月初 是星期几
        weekday = day.getDay();
        weekday = weekday ? weekday : WEEKEND;

        // ----- 一周日数(星期日)
        weekLen = 0;

        for (d = 0, dataLen=months[m].length; d<dataLen; d++) {
          // ---- 
          datas.push(months[m][d]);
          titles.day.push(year+"-"+fixDate(m+1)+"-"+fixDate(d+1)+":\n日空气质量指数（AQI）为：");

          weekday++;
          weekLen++;

          // ---- 一周周末 星期日
          if (weekday >= WEEKEND) {
            weeks.push(average(weekLen));
            weekday = 0;
            weekLen = 0;
            titles.week.push(year + "年" + (m+1) + "月第" + ++week +"周:\n平均空气质量指数（AQI）为：");
          }
          
        }

        // --- 月末不足一星期
        if (weekLen) {
          weeks.push(average(weekLen));
          titles.week.push(year + "年" + (m+1) + "月第" + ++week +"周:\n平均空气质量指数（AQI）为：");
        }

        months[m] = average(dataLen);
        titles.month[m] = year + "年" + (m+1) + "月:\n月均空气质量指数（AQI）为：";
      }

      // ---- 保存整理后的数据
      storeData.day = datas;
      storeData.week = weeks;
      storeData.month = months;
      
      this.chartData[name] = storeData;
      this.chartData[name].titles = titles;
    }
    this.renderChart();
  },

  /**
   *  初始化配制
   */
  initConfig: function() {
    var config = this.config,
        defaults = this.defaults,
        key;

    for (key in defaults) {
      this[key] = config[key] || defaults[key];

      if (typeof this[key] === null) {
        console.log(key + " not found in config");
        return;
      }
    }

    this.el = document.querySelector(this.el);
    this.target = this.el.querySelector(this.target);
  },
  defaults: {
    el: null,
    target: null,
    singleSelection: null,
    radioParent: null,
    radioName: null,
    chartClass: "",
    data: null
  },
   /**
   * 初始化函数
   */
  init: function() {
    this.initConfig();
    this.initGraTimeForm();
    this.initCitySelector();
    this.initAqiChartData();
  }

};

var app = new App({
      el: "body",
      target: ".aqi-chart-wrap",
      singleSelection: "#city-select",
      radioParent: "#form-gra-time",
      radioName: "gra-time",
      chartClass: {
        day: "chartGra chart-day",
        week: "chartGra chart-week",
        month: "chartGra chart-month"
      },
      data: aqiSourceData
});