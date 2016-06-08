(function() {

  var app = angular.module('estatisticas', ['angularUtils.directives.dirPagination']);

  app.directive('loading', ['$http', function($http) {
    return {
      restrict: 'A',
      link: function(scope, elm, attrs) {
        scope.isLoading = function() {
          return $http.pendingRequests.length > 0;
        };
        scope.$watch(scope.isLoading, function(v) {
          if (v) {
            elm.show();
          } else {
            elm.hide();
          }
        });
      }
    };
  }]);

  app.filter('getClassNumber', function() {
    return function(number) {
      return ((number > 0) ? "positivo" : ((number < 0) ? "negativo" : "neutro"));
    }
  });

  app.filter('getClassArrowNumber', function() {
    return function(number) {
      return ((number > 0) ? "positivo arrow-up" : ((number < 0) ? "negativo arrow-down" : "neutro"));
    }
  });

  app.filter('orderAthleteBy', function() {
    return function(input, attribute) {
      if (!angular.isObject(input)) return input;

      var array = [];
      for(var objectKey in input) {
        array.push(input[objectKey]);
      }

      array.sort(function(a, b) {
        a = parseInt(a[attribute]);
        b = parseInt(b[attribute]);
        return a - b;
      });
      return array;
    }
  });

  app.filter("localeOrderBy", function () {
    return function (array, sortPredicate, reverseOrder) {

      if (!Array.isArray(array)) {
        return array;
      }

      if (!sortPredicate) {
        return array;
      }

      var isString = function (value) {
        return (typeof value === "string");
      };

      var isNumber = function (value) {
        return (typeof value === "number");
      };

      var isBoolean = function (value) {
        return (typeof value === "boolean");
      };

      var arrayCopy = [];

      angular.forEach(array, function (item) {
        arrayCopy.push(item);
      });

      arrayCopy.sort(function (a, b) {
        var valueA = a[sortPredicate];
        var valueB = b[sortPredicate];
        if (isString(valueA)) {
          return !reverseOrder ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }
        if (isNumber(valueA) || isBoolean(valueA)) {
          return !reverseOrder ? valueA - valueB : valueB - valueA;
        }
        return 0;
      });
      return arrayCopy;
    }
  });

  app.controller('AtletasMercado', function($scope, $http) {

    $scope.removeAccents = function(actual, expected) {
      if (angular.isObject(actual)) return false;
      function removeAccents(value) {
        return value.toString().replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u').replace(/ñ/g,'n');
      }
      actual = removeAccents(angular.lowercase('' + actual));
      expected = removeAccents(angular.lowercase('' + expected));
      return actual.indexOf(expected) !== -1;
    }

    $scope.atletas_mercado = [];

    $http.get("load-api.php?api=atletas-mercado").success(function(data) {
      $scope.atletas_mercado = data;
      $('#result').show();
      $("#search-atleta-filter").removeClass("hide");
    });

  });

})();
