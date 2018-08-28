(function (dateRangePicker) {
  //make sure moment is installed and available
  if (!window.moment) console.error("dateRangePicker requires moment");

  var tpl = `
  <link rel="stylesheet" href="../styles.css">
  <div class="opener_wrpr">
    <input
      ng-model="inputStartDate"
      class="dp_inpt" 
      ng-value="endDate | date"  
      ng-class="{'open': show}"
      ng-focus="openDatePicker()"/>
  
    <input 
      ng-model="inputEndDate"
      class="dp_inpt" 
      ng-class="{'open': show}" 
      ng-value="endDate | date"  
      ng-focus="openDatePicker()" />

  </div>
  
  <!-- ng-show="show" -->
  <div  class="datepicker_wrpr" ng-mouseleave="calendarMouseLeft()">
    <div class="df">
    <div class="calendar_wrpr" ng-class="{'invisible' : !calendar.visible}" ng-repeat="calendar in calendars track by $index">
    <div class="df cal_mnth_hdr">
      <div ng-if="$index == 1" class="np_btn prev" ng-click="nextPrevious(-1)"></div>
      <p class="hdr_mnth">{{calendar.dateOfMonth | date : 'MMMM, yyyy'}}</p>
      <div ng-if="$index == (calendars.length - 2)" class="np_btn nxt" ng-click="nextPrevious(1)"></div>
    </div>
    
      <div class="week_wrpr" ng-repeat="week in calendar.weeks track by $index">
        <div
        class="day_wrpr" 
          ng-repeat="day in week.days track by $index"
          ng-click="day.onClick(day)"
          ng-mouseover="day.onHover(day)"
          ng-class="{
            'active' : day.date == startDate || day.date == endDate,
            'start' : day.date == startDate,
            'end' : day.date == endDate,
            'in-range' : isInRange(day),
            'in-selected-range' : day.date <= endDate && day.date >= startDate,
            'disabled' : day.disabled,
            'is-in-current-month' : day.isInCurrentMonth,
            'is-not-in-current-month' : !day.isInCurrentMonth
          }"
          >
          {{day.displayAs}}
        </div>
      </div>
    </div>
    </div>
    <div class="ftr">
    <p>{{startDate | date}}</p>

    <p>{{endDate ? '-' : ''}}</p>
    <p>{{endDate | date}}</p>
  </div>
</div>

  `;

  dateRangePicker.directive("dateRangePicker", dateRangePickerDir);

  dateRangePickerDir.$inject = ["$compile"];

  function dateRangePickerDir($compile) {
    function link(scope, element, attrs, ngModelCtrl) {
      var config = attrs.dateRangePicker || {};

      var defaultConfig = {
        currentDate: new Date(),
        isDisabled: isDisabled,
        onClickDate: angular.noop,
        onHoverDate: angular.noop,
        dayFormat: "DD",
        inputFormat: "MM d, YYYY",
        numOfCalendars: 2
      };

      var _config = angular.extend(defaultConfig, config);

      scope.calendars = buildCalendars(_config, scope);

      var template = $compile(tpl)(scope);
      element.append(template);

      scope.isInRange = function (day) {
        return day.date <= scope.dateHovering && day.date >= scope.startDate;
      };

      scope.calendarMouseLeft = function () {
        scope.dateHovering = null;
      };

      scope.openDatePicker = function () {
        scope.show = true;
      };

      scope.nextPrevious = nextPrevious(_config, scope);


      scope.updateStartInput = function (val) {
        /*var date = moment(val);


        if (date.isValid()) doStartDate(val = {
          date: Number(new Date(val))
        })
        else scope.inputStartDate = formatDate(scope.startDate);*/
      }

      function formatDate(date) {
        return moment(date).format(_config.inputFormat);
      }
    }

    function Calendar(options, scope, dateOfMonth) {

      var calendar = {
        dateOfMonth: Number(dateOfMonth)
      };

      var startCalendar = moment(dateOfMonth)
        .startOf("M")
        .startOf("w"),
        endCalendar = moment(dateOfMonth)
        .endOf("M")
        .endOf("w");

      calendar.numOfWeeks = endCalendar.diff(startCalendar, "w") + 1;
      calendar.weeks = [];

      var _date = moment(startCalendar);

      for (var i = 0; i < 6; i++) {
        var week = {
          index: i,
          days: []
        };

        for (var j = 0; j < 7; j++) {
          var day = {
            day: j,
            date: Number(_date),
            onClick: dayClickedFn(scope, options),
            onHover: dayHoveredFn(scope, options)
          };

          day.isDisabled = options.isDisabled(day);
          day.displayAs = moment(day.date).format(options.dayFormat);
          day.isInCurrentMonth =
            moment(day.date).month() == moment(dateOfMonth).month();

          week.days.push(day);
          _date.add(1, "d");
        }

        calendar.weeks.push(week);
      }

      return calendar;

    }

    function dayClickedFn(scope, options) {
      return function (day) {
        selectDateRange(scope, day);
        options.onClickDate(day);
      };
    }

    function dayHoveredFn(scope, options) {
      return function (day) {
        dayHovered(scope, day);
        options.onHoverDate(day);
      };
    }

    /**
     *
     * @param {Object} day
     * @param {Object} isDisabled
     */
    function selectDateRange(scope, day, isDisabled) {
      if (!scope.startDate) doStartDate(day, scope);
      else if (!scope.endDate) {
        if (day.date > scope.startDate) doEndDate(day, scope);
        else {
          doEndDate(scope._$startDate, scope);
          doStartDate(day, scope);
        }
      } else {
        if (day.date < scope.startDate) doStartDate(day, scope);
        else if (day.date > scope.endDate) doEndDate(day, scope);
        else {
          doEndDate(undefined, scope);
          doStartDate(day, scope);
        }
      }
    }

    function doStartDate(current, scope) {
      scope._$startDate = current;
      scope.startDate = current && current.date;
    }

    function doEndDate(current, scope) {
      scope._$endDate = current;
      scope.endDate = current && current.date;
    }

    function dayHovered(scope, day) {
      scope.dateHovering = day.date;
    }

    //default function for when date was clicked
    function isDisabled(day) {
      return {
        disableSelectDate: false,
        disableSelectStart: false,
        disableSelectEnd: false
      };
    }

    function buildCalendars(options, scope) {
      var cals = [];
      var numOfCalendars = options.numOfCalendars + 2;
      var dirNum = options.direction == 'backward' ? -1 : 1;

      var _date = moment(options.currentDate).add(dirNum * -1, 'M');
      for (let i = 0; i < numOfCalendars; i++) {
        var calendar = Calendar(options, scope, _date);
        cals.push(calendar);

        _date = moment(_date).add(dirNum, 'M');
      }
      
      return showHideCals(cals);
    }

    function nextPrevious(options, scope) {
      return function (dir) {
        let _date = dir == 1 ?
          scope.calendars[scope.calendars.length - 1].dateOfMonth :
          scope.calendars[0].dateOfMonth;
        let nDate = moment(_date).add(dir, 'M');
        let newMonth = Calendar(options, scope, nDate);
          newMonth.visible = false;
        if (dir = 1) {
          scope.calendars[scope.calendars.length - 1].visible = true;
          scope.calendars[1].visible = false;
          scope.calendars.push(newMonth);
          scope.calendars.shift();
        } else {
          scope.calendars[0].visible = true;
          scope.calendars[scope.calendars.length - 2].visible = false;
          scope.calendars.unshift(newMonth);
          scope.calendars.pop();
        }
        showHideCals(scope.calendars);
      }
    }

    function showHideCals(cals) {
      cals.forEach((c, i) => {        
        if (!i || i == (cals.length - 1)) c.visible = false;
        else c.visible = true;
      })
      return cals;
    }

    return {
      restrict: "A",
      require: "ngModel",
      link: link,
      scope: {
        startDate: "=",
        endDate: "=",
        ngModel: "="
      }
    };
  }
})(angular.module("dateRangePicker", []));