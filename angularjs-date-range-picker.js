(function (dateRangePicker) {
  //make sure moment is installed and available
  if (!window.moment) console.error("dateRangePicker requires moment");

  var tpl = `
  <link rel="stylesheet" href="../styles.css">
  <div class="opener_wrpr">
    <input
      ng-blur="updateStartInput(inputStartDate)"
      ng-model="inputStartDate"
      class="dp_inpt" 
      ng-class="{'open': show}"
      ng-focus="openDatePicker()"/>
  
    <input 
      ng-model="inputEndDate"
      class="dp_inpt" 
      ng-class="{'open': show}" 
      ng-value="endDate | date"  
      ng-focus="openDatePicker()" />

  </div>
  
  <div ng-show="show" class="datepicker_wrpr" ng-mouseleave="calendarMouseLeft()">
    <div ng-repeat="calendar in calendars track by $index">
      <div class="week_wrpr"  ng-repeat="week in calendar.weeks track by $index">
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
        numOfCalendars: 1
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

      scope.updateStartInput = function (val) {
        var date = moment(val);


        if (date.isValid()) doStartDate(val = {
          date: Number(new Date(val))
        })
        else scope.inputStartDate = formatDate(scope.startDate);
      }

      function formatDate(date) {
        return moment(date).format(_config.inputFormat);
      }
    }

    function Calendar(options, scope, dateOfMonth) {

      var calendar = {
        dateOfMonth : dateOfMonth
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
      var numOfCalendars =  options.numOfCalendars + 2;
      var dirNum = options.direction == 'backward' ? -1 : 1;

      var _date = moment(options.currentDate).add(dirNum * -1, 'M');
      for (let i = 0; i < numOfCalendars; i++) {
        var calendar = Calendar(options, scope, _date);
        if(!i || i == (numOfCalendars-1)) calendar.visible = false;
        else calendar.visible = true;
        cals.push(calendar);

       _date = moment(_date).add(dirNum, 'M');
      }
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