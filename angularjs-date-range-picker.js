(function (dateRangePicker) {

  //make sure moment is installed and available
  if (!window.moment) console.error('dateRangePicker requires moment');

  var tpl = `<div>
  <div ng-repeat="week in calendar.weeks track by $index">
    <div ng-repeat="day in week.days track by $index" ng-click="day.onClick(day)" ng-hover="day.onHover(day)">
      {{day.displayAs}}
    </div>
  </div>
</div>`;

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
      if(!scope.startDate) scope.startDate = date;
      else scope.endDate = date;
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