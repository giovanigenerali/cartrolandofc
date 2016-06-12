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

app.directive('tooltip', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      $(element).hover(function(){
        // on mouseenter
        $(element).tooltip('show');
      }, function(){
        // on mouseleave
        $(element).tooltip('hide');
      });
    }
  };
});

app.filter('getClassNumber', function() {
  return function(number) {
    return ((number > 0) ? 'positivo' : ((number < 0) ? 'negativo' : 'neutro'));
  }
});

app.filter('getClassArrowNumber', function() {
  return function(number) {
    return ((number > 0) ? 'positivo arrow-up' : ((number < 0) ? 'negativo arrow-down' : 'neutro'));
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

app.filter('localeOrderBy', function () {
  return function (array, sortPredicate, reverseOrder) {

    if (!Array.isArray(array)) {
      return array;
    }

    if (!sortPredicate) {
      return array;
    }

    var isString = function (value) {
      return (typeof value === 'string');
    };

    var isNumber = function (value) {
      return (typeof value === 'number');
    };

    var isBoolean = function (value) {
      return (typeof value === 'boolean');
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

app.filter('formatDataHoraPartida', function() {
  return function(partida) {
    var diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        dataDaPartida = new Date(partida.partida_data.replace(/-/g, "/")),
        diaDaSemana = diasDaSemana[dataDaPartida.getDay()],
        dia = dataDaPartida.getDate() < 10 ? "0" + dataDaPartida.getDate() : dataDaPartida.getDate(),
        mes = ("0" + (dataDaPartida.getMonth() + 1)).slice(-2),
        ano = dataDaPartida.getFullYear(),
        hora = dataDaPartida.getHours() < 10 ? "0" + dataDaPartida.getHours() : dataDaPartida.getHours(),
        minutos = dataDaPartida.getMinutes() < 10 ? "0" + dataDaPartida.getMinutes() : dataDaPartida.getMinutes();
    return diaDaSemana + " " + [dia, mes, ano].join("/") +" - "+ hora + ":" + minutos;
  }
});

app.controller('AtletasMercado', function($scope, $http) {

  $scope.athleteDetais = false;

  $scope.timestamp = Math.floor(Date.now()/1000);

  $scope.removeAccents = function(actual, expected) {
    if (angular.isObject(actual)) return false;
    function replaceStrAccent(str) {
      return str.toString()
        .replace(/[àáâãäå]/,'a')
        .replace(/[eéèëê]/,'e')
        .replace(/[iíìïî]/,'i')
        .replace(/[oóòõöô]/,'o')
        .replace(/[uúùüû]/,'u')
        .replace(/[ñ]/,'n')
        .replace(/[ç]/,'c');
    }
    actual = replaceStrAccent(angular.lowercase('' + actual));
    expected = replaceStrAccent(angular.lowercase('' + expected));
    return actual.indexOf(expected) !== -1;
  }

  $scope.atletas_mercado = [];

  $http.get('load-api.php?api=atletas-mercado').success(function(data) {
    $scope.atletas_mercado = data;
    $("#result").show();
    $("#search-atleta-filter").removeClass("hide");
  });

});
