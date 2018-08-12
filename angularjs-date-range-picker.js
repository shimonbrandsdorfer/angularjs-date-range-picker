(function(dateRangePicker) {

  //make sure moment is installed and available
  if(!window.moment) console.error('dateRangePicker requires moment');

  dateRangePicker.directive('dateRangePicker', dateRangePickerDir);

  dateRangePickerDir.$inject = [];

  function dateRangePickerDir(){

    function link(scope, element, attrs){

    }

    function initCalendar(currentMonth){

    }

    return {
      restrict: 'E',
      link: link
    };
  }


})(angular.module('dateRangePicker', []));
