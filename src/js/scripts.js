/* Cartrolando FC - http://cartrolandofc.com
 * https://github.com/wgenial/cartrolandofc
 * Desenvolvido por WGenial - http://wgenial.com.br
 * License: MIT <http://opensource.org/licenses/mit-license.php> - see LICENSE file
 */

function searchTeam() {
  var $team_input = $("#team-name"),
      team_name = decodeURI($team_input.val()).toLowerCase();

  if (team_name === "") {
    showMessage("Digite o nome do seu time para consultar!","warning");
    $("#team_info").hide();
    teamsList("hide");
    return false;
  }

  $.ajax({
    type: "GET",
    contentType: "application/json",
    cache: false,
    url: "load-api.php",
    data: {
      api: "busca-time",
      team: team_name
    },
    beforeSend: function() {
      loading("show");
      $("#team_info").hide();
      teamsList("hide");
      $(".team_escalacao table").html("");

    },
    success: function(teams) {
      var teams_total = teams.length;

      if (teams_total == 0) {
        showMessage("O time que você digitou não foi encontrado, verifique se o nome está correto!","info");
        $("#team_info").hide();
        loading("hide");
        teamsList("hide");
        return false;
      } else if (teams_total > 1) {
        showTeamsList(teams, teams_total);
        loading("hide");
      } else {
        var team_slug = teams[0].slug;
        getAthletes(team_slug);
      }
    },
    error: function () {
      showMessage("Ocorreu algum erro ao consultar seu time!<br> Aguarde alguns instantes para uma nova consulta.","danger");
      $("#team_info").hide();
      teamsList("hide");
      loading("hide");
      return false;
    }
  });
}

function showTeamsList(teams, teams_total) {
  var $team_input = $("#team-name"),
      $teams_list = $("#teams_list");

  $teams_list.html("");
  teamsList("hide");
  loading("show");

  var team_row_content = "<ul class='teams'>";

  for (var i=0; i < teams.length; i++) {
    var team_slug = teams[i].slug,
        team_nome = teams[i].nome,
        team_escudo = teams[i].url_escudo_svg,
        team_nome = teams[i].nome,
        team_cartoleiro = teams[i].nome_cartola;

    team_row_content += " \
      <li data-slug='"+ team_slug +"' data-nome='"+ team_nome +"'> \
        <img src="+ team_escudo +" class='escudo'> \
        <div class='nome'>"+ team_nome +"</div> \
        <div class='cartola'>"+ team_cartoleiro +"</div> \
      </li> \
    <br>";
  }

  team_row_content += "</ul>";

  $teams_list.append(team_row_content);

  $teams_list.find("li").on("click", function() {
    teamsList("hide");
    $team_input.val("").val($(this).data("nome"));
    getAthletes($(this).data("slug"));
  });

  teamsList("show");
}

function getParciaisRodada() {
  return $.ajax({
    type: "GET",
    contentType: "application/json",
    dataType: "json",
    cache: false,
    url: "load-api.php?api=parciais-atletas",
    success: function(data) {
      return data;
    }
  });
}

function statusParciaisRodada() {
  getParciaisRodada().done(function(result) {
    atletas_pontuados = result.atletas;
  });
}

function getMercado() {
  return $.ajax({
    type: "GET",
    contentType: "application/json",
    dataType: "json",
    cache: false,
    url: "load-api.php?api=mercado-status",
    success: function(data) {
      return data;
    }
  });
}

function statusMercado() {
  getMercado().done(function(result) {
    mercado_status = result.status_mercado;
    rodada_atual = result.rodada_atual;
    game_over = result.game_over;
  });
}

function getAthletes(team_slug) {

  var $team_input = $("#team-name"),
      $team_escudo = $(".team_escudo"),
      $team_nome = $(".team_nome h1"),
      $team_cartola = $(".team_nome h3"),
      $team_rodada = $(".team_rodada"),
      $team_pontuacao = $(".team_pontuacao"),
      $result_athletes = $("#result_athletes"),
      $team_escalacao = $(".team_escalacao table");

  $.ajax({
    type: "GET",
    contentType: "application/json",
    cache: false,
    url: "load-api.php",
    data: {
      api: "busca-atletas",
      team_slug: team_slug
    },
    beforeSend: function() {
      loading("show");
      $team_escudo.html("");
      $team_nome.html("");
      $team_cartola.html("");
      $team_rodada.html("");
      $team_pontuacao.html("");
      $team_escalacao.html("");
      $result_athletes.addClass("hide");
    },
    success: function(request) {

      if (request.length == 0) {
        showMessage("Ocorreu algum erro ao consultar a lista de jogadores!<br> Tente novamente ou aguarde alguns instantes para uma nova consulta...","danger");
        teamsList("hide");
        loading("hide");
        return false;
      }

      var athletes = request.atletas,
          team = request.time,
          escalacao_rows = "<tbody>";

      // team
      if (typeof team !== "undefined") {

        var team_escudo = (team.url_escudo_png == "" ? "" : "<img src="+ team.url_escudo_png +">"),
            team_nome = (team.nome == "" ? "" : team.nome),
            team_cartola = (team.nome_cartola == "" ? "" : team.nome_cartola),
            team_patrimonio = (team.patrimonio == "" ? "" : team.patrimonio);

        $team_escudo.html(team_escudo);
        $team_nome.html(team_nome);
        $team_cartola.html(team_cartola);
      }

      // athletes
      if (typeof athletes !== "undefined" && athletes != null) {

        if (athletes.length > 0) {

          var team_rodada = (typeof rodada_atual !== "undefined") ? rodada_atual : athletes[0].rodada_id;
          if (team_rodada != "") {
            $team_rodada.html(team_rodada + "ª Rodada");
          }

          // rodada label
          var pontuacao_label = (typeof atletas_pontuados !== "undefined") ? "Pontos parciais" : "Pontuação";

          // pontuacao total do time
          var team_pontuacao = 0;
          if (game_over) {
            team_pontuacao = (request.pontacao == null) ? team_pontuacao : request.pontacao;
          }

          // loop athletes
          $.each(athletes, function(inc, athlete) {

            // escludo clube
            var athlete_clube_escudo = "", clube_escudo45x45 = "";
            if (athlete.clube_id != 1) {
              clube_escudo45x45 = request.clubes[athlete.clube_id].escudos['45x45'];
              if (typeof clube_escudo45x45 !== "undefined" && clube_escudo45x45 !== "") {
                athlete_clube_escudo = "<img src='"+ clube_escudo45x45 +"'>";
              }
            }

            // athlete info
            var athlete_foto = athlete.foto,
                athlete_posicao = request.posicoes[athlete.posicao_id].abreviacao.toUpperCase(),
                athlete_nome = (athlete.apelido == "" ? "---" : athlete.apelido.toUpperCase());

            // athlete points
            var athlete_pontos;

            if (!game_over) {
              athlete_pontos = (typeof atletas_pontuados[athlete.atleta_id] !== "undefined") ? atletas_pontuados[athlete.atleta_id].pontuacao.toFixed(2) : "---";
              team_pontuacao += (typeof atletas_pontuados[athlete.atleta_id] !== "undefined") ? atletas_pontuados[athlete.atleta_id].pontuacao : 0;
            } else if (game_over) {
              athlete_pontos = athlete.pontos_num.toFixed(2);
            } else {
              athlete_pontos = "---";
            }

            escalacao_rows += " \
            <tr> \
            <td class='athlete_clube'>"+ athlete_clube_escudo +"</td> \
            <td class='athlete_foto'><img class='img-full' src='"+ athlete_foto.replace("FORMATO", "140x140") +"'></td> \
            <td class='athlete_nome'>"+ athlete_nome +"</td> \
            <td class='athlete_posicao'>"+ athlete_posicao +"</td> \
            <td class='athlete_pontos'>"+ athlete_pontos +"</td> \
            </tr> \
            ";
          });
          $team_escalacao.append(escalacao_rows);

          // team pontuacao
          $team_pontuacao.html("<span class='pontos-label'>"+ team_pontuacao.toFixed(2) + "</span> <span class='pontuacao-label'>"+ pontuacao_label +"</span>");

          formatPontuacao();
          formatPontuacaoTime();
          $("#team_info").show();
          loading("hide");

        } else {
          showMessage("A escalação desse time ainda não pode ser exibida.");
          teamsList("hide");
          loading("hide");
        }

      } else {
        showMessage(request.mensagem);
        teamsList("hide");
        loading("hide");
      }

    },
    complete: function() {
      $result_athletes.removeClass("hide");
    },
    error: function (error) {
      showMessage("Ocorreu algum erro ao consultar os atletas do seu time!<br> Tente novamente ou aguarde alguns instantes para uma nova consulta...","danger");
      teamsList("hide");
      loading("hide");
      $result_athletes.removeClass("hide");
      return false;
    }
  });
}

function formatPontuacao() {
  $(".athlete_pontos").each(function() {
    $(this).removeClass("neutro negativo");

    if ($(this).html().indexOf("---") == 0) {
      $(this).addClass("neutro");
    } else if ($(this).html().indexOf("-") == 0) {
      $(this).addClass("negativo");
    }
  });
}

function formatPontuacaoTime() {
  var $pts_label = $(".pontos-label");
  if ($pts_label.size() > 0) {
    if ($pts_label.html().indexOf("---") == 0) {
      $pts_label.addClass("neutro");
    } else if ($pts_label.html().indexOf("-") == 0) {
      $pts_label.addClass("negativo");
    } else {
      $pts_label.addClass("positivo");
    }
  }
}

function loading(status) {
  var $loading = $("#loading");

  if (status == "show") {
    $loading.show();
  } else if (status == "hide") {
    $loading.hide();
  } else {
    $loading.show();
  }
}

function teamsList(status) {
  var $teams_list = $("#teams_list");

  if (status == "show") {
    $teams_list.show();
  } else if (status == "hide") {
    $teams_list.hide();
  } else {
    $teams_list.show();
  }
}

function getPontuacaoAtletas() {
  var $lista_atletas = $(".team_escalacao table"),
      $rodada_atual = $(".rodada-atual"),
      $input_search_atleta = $("#search-atleta"),
      $btn_load_pontuacao = $("#load-pontuacao"),
      $btn_refresh_pontuacao = $("#refresh-pontuacao"),
      message = "";;

  $.ajax({
    type: "GET",
    contentType: "application/json",
    cache: false,
    url: "load-api.php",
    data: {
      api: "parciais-atletas"
    },
    beforeSend: function() {
      $input_search_atleta.addClass("hide");
      $rodada_atual.html("").addClass("hide");
      $lista_atletas.html("").hide();
      loading("show");
      $("#refresh-pontuacao").addClass("hide");
    },
    success: function(request) {

      if (request.length == 0) {
        showMessage("Ocorreu algum erro ao consultar os atletas da rodada atual!<br> Tente novamente ou aguarde alguns instantes para uma nova consulta...","danger");
        loading("hide");
        return false;
      }

      var atletas = request.atletas,
          atletas_rows = "<tbody>";

      if (typeof atletas !== "undefined" && request.atletas != "") {

        $.each(atletas, function(inc, atleta) {

          // escludo clube
          var atleta_clube_escudo = "", clube_escudo45x45 = "";
          if (atleta.clube_id != 1) {
            clube_escudo45x45 = request.clubes[atleta.clube_id].escudos['45x45'];
            if (typeof clube_escudo45x45 !== "undefined" && clube_escudo45x45 !== "") {
              atleta_clube_escudo = "<img src='"+ clube_escudo45x45 +"'>";
            }
          }

          // atleta info
          var atleta_posicao = request.posicoes[atleta.posicao_id].abreviacao.toUpperCase(),
              atleta_nome = (atleta.apelido == "" ? "---" : atleta.apelido.toUpperCase());

          // atleta foto
          var atleta_foto = atleta.foto, atleta_foto80x80 = "";
          if (atleta_foto !== "" && atleta_foto !== null) {
            atleta_foto80x80 = "<img class='img-full' src='"+ atleta_foto.replace("FORMATO", "140x140") +"'>";
          } else {
            atleta_foto80x80 = "<img class='img-full' src='images/foto-jogador.svg'>";
          }

          // athlete pontuacao
          var atleta_pontuacao = atleta.pontuacao.toFixed(2);

          atletas_rows += " \
          <tr> \
          <td class='athlete_clube'>"+ atleta_clube_escudo +"</td> \
          <td class='athlete_foto'>"+ atleta_foto80x80 +"</td> \
          <td class='athlete_nome'>"+ atleta_nome +"</td> \
          <td class='athlete_posicao'>"+ atleta_posicao +"</td> \
          <td class='athlete_pontos'>"+ atleta_pontuacao +"</td> \
          </tr> \
          ";
        });

        $lista_atletas.append(atletas_rows).show();
        $rodada_atual.html(request.rodada + "ª Rodada");

      } else {

        if (typeof request.mensagem !== "undefined" && request.mensagem !== "") {
          message = request.mensagem;
        } else {
          message = "A escalação desse time ainda não pode ser exibida.";
        }
        atletas_rows += "<tr><td class='text-center msg'>"+ message +"</td></tr>";
        $lista_atletas.append(atletas_rows).show();
        $rodada_atual.addClass("hide");
        loading("hide");
        return false;
      }

      // config pontuacao
      $(".athlete_pontos").each(function() {
        $(this).removeClass("neutro negativo");

        if ($(this).html().indexOf("---") == 0) {
          $(this).addClass("neutro");
        } else if ($(this).html().indexOf("-") == 0) {
          $(this).addClass("negativo");
        }
      })

    },
    complete: function() {
      loading("hide");
      if (message != "") {
        $input_search_atleta.addClass("hide");
        $btn_load_pontuacao.addClass("hide");
        $btn_refresh_pontuacao.removeClass("hide");
        $rodada_atual.addClass("hide");
      } else {
        $input_search_atleta.removeClass("hide");
        $btn_load_pontuacao.addClass("hide");
        $btn_refresh_pontuacao.removeClass("hide");
        $rodada_atual.removeClass("hide");
        searchRows();
      }
    },
    error: function (error) {
      showMessage("Ocorreu algum erro ao consultar os atletas da rodada atual!<br> Tente novamente ou aguarde alguns instantes para uma nova consulta...","danger");
      $input_search_atleta.addClass("hide");
      $btn_load_pontuacao.removeClass("hide");
      $btn_refresh_pontuacao.addClass("hide");
      $rodada_atual.html("").addClass("hide");
      $lista_atletas.html("").hide();
      loading("hide");
      return false;
    }
  });
}

function showMessage(message, type) {
  var msg_type = "info"; // success, info, warning and danger.
  if (typeof type !== "undefined" && type !== "") {
    msg_type = type;
  }
  $(".team_escalacao table").html("").append("<tr><td class='text-center "+ msg_type +"'>"+ message +"</td></tr>");
}

function searchRows() {
  var $tbody = $(".table").find("tbody");
  $("#atleta").unbind("keyup");
  if ($tbody.find("tr").length > 0) {
    $("#atleta")
      .keydown(function(event) {
        if (event.keyCode == 13) {
          event.preventDefault();
          return false;
        }
      })
      .keyup(function() {
        _this = this;
        var inc = 0;
        $("#nenhum-jogador").remove();
        $.each($tbody.find("tr"), function() {
          if ($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) == -1) {
            $(this).hide();
          } else {
            $(this).show();
            inc++;
          }
        });
        if (inc == 0) {
          $("#result_athletes .table").append("<tr id='nenhum-jogador'><td class='text-center info'>Nenhum jogado encontrado.</td></tr>");
        } else {
          $("#result_athletes .table").removeClass("hide");
          $("#nenhum-jogador").remove();
        }
      });
  } else {
    $("#search-team").addClass("hide");
  }
}

atletas_pontuados = null;
rodada_atual = 0;
mercado_status = 0;
game_over = true;

$("#search-team").on("click", function() {
  searchTeam();
  statusMercado();
  statusParciaisRodada();
});

$("#team-name").keypress(function(e) {
  if (e.which == 13) {
    searchTeam();
    statusMercado();
    statusParciaisRodada();
  }
});

$("#load-pontuacao, #refresh-pontuacao").on("click", function() {
  getPontuacaoAtletas();
});
