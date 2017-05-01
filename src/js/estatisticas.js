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
  return function(partida_data) {
    if (partida_data != undefined) {
      var diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
          dataDaPartida = new Date(partida_data.replace(/-/g,"/")),
          diaDaSemana = diasDaSemana[dataDaPartida.getDay()],
          dia = dataDaPartida.getDate() < 10 ? "0"+dataDaPartida.getDate() : dataDaPartida.getDate(),
          mes = ("0"+(dataDaPartida.getMonth()+1)).slice(-2),
          ano = dataDaPartida.getFullYear(),
          hora = dataDaPartida.getHours() < 10 ? "0"+dataDaPartida.getHours() : dataDaPartida.getHours(),
          minutos = dataDaPartida.getMinutes() < 10 ? "0"+dataDaPartida.getMinutes() : dataDaPartida.getMinutes();
      return diaDaSemana+" "+[dia,mes,ano].join("/") +" - "+ hora+":"+minutos;
    }
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

  $http.get('load-api.php?api=atletas-mercado').then(function(atletas_mercado) {
    
    $scope.atletas_mercado = atletas_mercado.data;
    var atletas = atletas_mercado.data.atletas;

    $http.get('load-api.php?api=partidas&rodada='+ rodada_atual).then(function(partidas) {
      var partidas = partidas.data.partidas;
      for (var i=0; i < atletas.length; i++) {
        var atleta_clube_id = atletas[i].clube_id;
        for(var ii=0; ii < partidas.length; ii++) {
          var partida = partidas[ii];
          if (atleta_clube_id == partida.clube_casa_id || atleta_clube_id == partida.clube_visitante_id) {
            atletas[i]["partida"] = partida;
          }
        }
      }
      $scope.atletas_mercado.atletas = atletas;
    });

    $("#result").show();
    $("#search-atleta-filter").removeClass("hide");

  });

});
