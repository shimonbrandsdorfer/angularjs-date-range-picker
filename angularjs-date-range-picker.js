(function (dateRangePicker) {

  //make sure moment is installed and available
  if (!window.moment) console.error('dateRangePicker requires moment');

  var tpl = `
  <link rel="stylesheet" href="../styles.css">
  <div  class="datepicker_wrpr">
  <div class="week_wrpr"  ng-repeat="week in calendar.weeks track by $index">
    <div
    class="day_wrpr" 
      ng-repeat="day in week.days track by $index"
      ng-click="day.onClick(day)"
      ng-hover="day.onHover(day)"
      ng-class="{
        'active' : startDate == day.date || endDate == day.date,
        'start' : startDate == day.date,
        'in-range' : startDate < day.date && endDate > day.date,
        'disabled' : day.disabled
      }"
      >
      {{day.displayAs}}
    </div>
  </div>
</div>

  `;

  dateRangePicker.directive('dateRangePicker', dateRangePickerDir);

  dateRangePickerDir.$inject = ['$compile'];

  function dateRangePickerDir($compile) {

    function link(scope, element, attrs) {
      var config = attrs.dateRangePicker || {};

      var defaultConfig = {
        currentDate: new Date(),
        isDisabled: isDisabled,
        onClickDate: defDateClicked,
        dayFormat: 'DD'
      };

      var _config = angular.extend(defaultConfig, config);

      scope.calendar = Calendar(_config, scope);

      var template = $compile(tpl)(scope);
      element.append(template);
    }

    function Calendar(options, scope) {
      var calendar = {};

      var startCalendar = moment(options.currentDate).startOf('M').startOf('w'),
        endCalendar = moment(options.currentDate).endOf('M').endOf('w');

      calendar.numOfWeeks = endCalendar.diff(startCalendar, 'w') + 1;
      calendar.weeks = [];

      var _date = moment(startCalendar);

      for (var i = 0; i < calendar.numOfWeeks; i++) {

        var week = {
          index: i,
          days: []
        };

        for (var j = 0; j < 7; j++) {

          var day = {
            day: j,
            date: Number(_date),
            onClick: dayClickedFn(options, scope),
            onHover: dayHovered
          };

          day.isDisabled = options.isDisabled(day);
          day.displayAs = moment(day.date).format(options.dayFormat);

          week.days.push(day);
          _date.add(1, 'd');
        }

        calendar.weeks.push(week);
      }

      return calendar;

    }

    function dayClickedFn(options, scope) {
      return function (day) {
        var isDisabled = day.isDisabled;

        if (isDisabled.disableSelectDate) return;

        var daySettings = options.onClickDate(day);

        selectDateRange(scope, day.date, isDisabled);
      }
    }

    function dayHovered() {

    }


    /**
     * 
     * @param {Number} date 
     * @param {Object} isDisabled 
     */
    function selectDateRange(scope, date, isDisabled) {

      switch (true) {
        case (!scope.startDate || date < scope.startDate) && !isDisabled.disableSelectStart:
        //  if (!options.isDisabled(scope.startDate).disableSelectEnd) scope.endDate = scope.startDate;
          scope.startDate = date;
          break;
        case date == scope.startDate:
          scope.startDate = null;
          break;
        case scope.startDate && date > scope.startDate && !isDisabled.disableSelectEnd:
          scope.endDate = date;
          break;
        case date == scope.endDate:
          scope.endDate = null;
          break;

      }
    }

    //default function for when date was clicked
    function isDisabled(day) {
      return {
        disableSelectDate: false,
        disableSelectStart: false,
        disableSelectEnd: false
      };
    }

    function defDateClicked(day) {

    }

    return {
      restrict: 'A',
      link: link,
      scope: {
        startDate: '=',
        endDate: '='
      }
    };
  }


})(angular.module('dateRangePicker', []));