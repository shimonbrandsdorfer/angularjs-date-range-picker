(function(dateRangePicker) {

  //make sure moment is installed and available
  if(!window.moment) console.error('dateRangePicker requires moment');

  dateRangePicker.directive('dateRangePicker', dateRangePickerDir);

  dateRangePickerDir.$inject = [];

  function dateRangePickerDir(){

    function link(scope, element, attrs){
      var config = attrs.dateRangePicker || {};

      var defaultConfig = {
        currentDate : new Date(),
        isDisabled : isDisabled,
        onClickDate : defDateClicked
      };

      var _config = angular.extend(defaultConfig, config);

      scope.calendar = Calendar(_config);
    }

    function Calendar(options){
      var calendar = {};

      var startCalendar = moment(options.currentDate).startOf('M').startOf('w'),
        endCalendar = moment(options.currentDate).endOf('M').endOf('w');

      calendar.numOfWeeks = endCalendar.diff(startCalendar, 'w');
      calendar.weeks = [];

      var _date = moment(startCalendar);

      for(var i = 0; i < calendar.numOfWeeks; i++){

        var week = {
          index : i,
          days : []
        };

        for(var j = 0; j < 7; j++){

          var day = {
            day : j,
            date : Number(_date.add(1 ,'d')),
            onClick : dayClicked,
            onhover : dayHovered
          };

          day.isDisabled = options.isDisabled(day);

          week.days.push(day);
        }

        calendar.weeks.push(week);
      }

      return calendar;

    }

    function dayClicked(day){
      var isDisabled = day.isDisabled;

      if(isDisabled.disableSelectDate) return;

      var daySettings = options.onClickDate(day);

      selectDateRange(day.date, isDisabled);
      
    }

    function dayHovered(){

    }


    /**
     * 
     * @param {Number} date 
     * @param {Object} isDisabled 
     */
    function selectDateRange(date, isDisabled){

    }

    //default function for when date was clicked
    function isDisabled(day){
      return {
        disableSelectDate : false,
        disableSelectStart : false,
        disableSelectEnd : false
      };
    }

    function defDateClicked(day){
      
    }

    return {
      restrict: 'A',
      link: link,
      scope : {
        startDate : '=',
        endDate : '='
      }
    };
  }


})(angular.module('dateRangePicker', []));
