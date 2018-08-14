(function (dateRangePicker) {

  //make sure moment is installed and available
  if (!window.moment) console.error('dateRangePicker requires moment');

  var tpl = `
  <link rel="stylesheet" href="../styles.css">
  <div class="datepicker_wrpr">
    <div class="week_wrpr" ng-repeat="week in calendar.weeks track by $index">
      <div class="day_wrpr" ng-repeat="day in week.days track by $index" ng-click="day.onClick(day)" ng-hover="day.onHover(day)">
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
        onClickDate: angular.noop,
        onHoverDate : angular.noop,
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
            onClick: dayClickedFn(scope, options),
            onHover: dayHoveredFn(scope, options)
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

    function dayClickedFn(scope, options) {
      return function (day) {
        selectDateRange(scope, day);
        options.onClickDate(day);
      }
    }

    function dayHoveredFn(scope, options) {
      return function (day) {
        dayHovered(scope, day);
        options.onHoverDate(day);
      }
    }


    /**
     * 
     * @param {Object} day
     * @param {Object} isDisabled 
     */
    function selectDateRange(scope, day, isDisabled) {
      if(!scope.startDate) doStartDate(scope._$startDate, day);
      else scope.endDate = doEndDate(scope._$endDate, day);
    }

    function doStartDate(current, prev){
      if(prev){
        prev.active = false;
        prev.start = false;
      }
      scope._$startDate = current;
      scope.startDate = current.date;
      current.active = true;
      current.start = true;
    }

    function doEndDate(current, prev){
      if(prev){
        prev.active = false;
        prev.end = false;
      }
      scope._$endDate = current;
      scope.endDate = current.date;
      current.active = true;
      current.end = true;
    }

    function dayHovered(day, scope){
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