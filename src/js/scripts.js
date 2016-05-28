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
    $("#team_info_wrapper").hide();
    teamsList("hide");
    $("#result_athletes").removeClass("hide");
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
      $("#team_info_wrapper").hide();
      teamsList("hide");
      $("#team_escalacao table").html("");

    },
    success: function(teams) {
      var teams_total = teams.length;

      if (teams_total == 0) {
        showMessage("O time que você digitou não foi encontrado, verifique se o nome está correto!","info");
        $("#team_info_wrapper").hide();
        loading("hide");
        teamsList("hide");
        $("#result_athletes").removeClass("hide");
        return false;
      } else if (teams_total > 1) {
        showTeamsList(teams, teams_total);
        loading("hide");
        $("#result_athletes").removeClass("hide");
      } else {
        var team_slug = teams[0].slug;
        getAthletes(team_slug);
      }
    },
    error: function () {
      showMessage("Ocorreu algum erro ao consultar seu time!<br> Aguarde alguns instantes para uma nova consulta.","danger");
      $("#team_info_wrapper").hide();
      teamsList("hide");
      loading("hide");
      $("#result_athletes").removeClass("hide");
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
    ";
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
    mercado_pos_rodada = result.mercado_pos_rodada;
  });
}

function getAthletes(team_slug) {

  var $team_input = $("#team-name"),
      $team_escudo = $("#team_escudo"),
      $team_nome = $(".team_nome"),
      $team_patrimonio = $(".team_patrimonio"),
      $team_rodada = $(".team_rodada"),
      $team_pontuacao = $(".team_pontuacao"),
      $result_athletes = $("#result_athletes"),
      $team_escalacao = $("#team_escalacao table");

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
      $team_rodada.html("");
      $team_pontuacao.html("");
      $team_patrimonio.html("");
      $team_escalacao.html("");
      $result_athletes.addClass("hide");
    },
    success: function(request) {

      if (request.length == 0) {
        showMessage("Ocorreu algum erro ao consultar a lista de jogadores!<br> Tente novamente ou aguarde alguns instantes para uma nova consulta...","danger");
        teamsList("hide");
        loading("hide");
        $("#result_athletes").removeClass("hide");
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
            team_patrimonio = (request.patrimonio == "" ? "" : request.patrimonio);

        $team_escudo.html(team_escudo);
        $team_nome.html("<h1>"+ team_nome +"</h1><h3>"+ team_cartola +"</h3>");
      }

      // athletes
      if (typeof athletes !== "undefined" && athletes != null) {

        if (athletes.length > 0) {

          // rodada info
          var team_rodada = (mercado_status == 1) ? athletes[0].rodada_id : rodada_atual;
          $team_rodada.html(team_rodada + "ª Rodada");
          var pontuacao_label = (mercado_status == "1") ? "Pontuação" : "Pontos parciais";

          // pontuacao total do time
          var team_pontuacao = 0;
          if (mercado_status == 1) {
            team_pontuacao = (request.pontos == null) ? team_pontuacao : request.pontos;
          }

          // loop nos atletas
          $.each(athletes, function(inc, athlete) {

            // escudo clube
            var athlete_clube_escudo = "", clube_escudo45x45 = "";
            if (athlete.clube_id != 1) {
              clube_escudo45x45 = request.clubes[athlete.clube_id].escudos['45x45'];
              if (typeof clube_escudo45x45 !== "undefined" && clube_escudo45x45 !== "") {
                athlete_clube_escudo = "<img src='"+ clube_escudo45x45 +"'>";
              }
            }

            // atletas inforacoes (foto, posicao e nome)
            var atleta_foto = athlete.foto, atleta_foto140x140 = "";
            if (atleta_foto !== "" && atleta_foto !== null) {
              atleta_foto140x140 = "<img src='"+ atleta_foto.replace("FORMATO", "140x140") +"'>";
            } else {
              atleta_foto140x140 = "<img src='images/foto-jogador.svg'>";
            }
            var athlete_posicao = request.posicoes[athlete.posicao_id].nome.toUpperCase(),
                athlete_nome = (athlete.apelido == "" ? "-" : athlete.apelido.toUpperCase());

            // atletas pontuacao
            var athlete_pontos;

            // mercado fechado, pega pontuacao dos atletas da rodada em andamento
            if (mercado_status == 2) {
              athlete_pontos = (typeof atletas_pontuados !== "undefined" && typeof atletas_pontuados[athlete.atleta_id] !== "undefined") ? atletas_pontuados[athlete.atleta_id].pontuacao.toFixed(2) : "0.00";
              team_pontuacao += (typeof atletas_pontuados !== "undefined" && typeof atletas_pontuados[athlete.atleta_id] !== "undefined") ? atletas_pontuados[athlete.atleta_id].pontuacao : 0.00;
            // mercado aberto, pega pontuacao dos atletas da rodada anterior
          } else if (mercado_status == 1) {
              athlete_pontos = athlete.pontos_num.toFixed(2);
            // fallback, atleta sem pontuacao
            } else {
              athlete_pontos = "-";
            }

            escalacao_rows += " \
            <tr> \
              <td> \
                <div class='athlete_clube'>"+ athlete_clube_escudo +"</div> \
                <div class='athlete_foto'>"+ atleta_foto140x140 +"</div> \
              </td> \
              <td class='athlete_nome_posicao'> \
                <span class='athlete_nome_label'>"+ athlete_nome +"</span> \
                <span class='athlete_posicao_label'>"+ athlete_posicao +"</span> \
              </td> \
              <td class='athlete_pontos'>"+ athlete_pontos +"</td> \
            </tr> \
            ";
          });

          $team_escalacao.append(escalacao_rows);

          // time pontuacao
          $team_pontuacao.html("<div class='pontos-total'>"+ team_pontuacao.toFixed(2) + "</div> <div class='pontuacao-label'>"+ pontuacao_label +"</div>");

          // time patrimonio
          $team_patrimonio.html("<div class='patrimonio-total'>C$ "+ team_patrimonio.toFixed(2) + "</div> <div class='patrimonio-label'>Patrimôminio</div>");

          formatPontuacaoTime();
          formatPontuacaoAtletas();

          $("#team_info_wrapper").show();
          loading("hide");

        } else {
          showMessage("A escalação desse time ainda não pode ser exibida.");
          teamsList("hide");
          loading("hide");
          $("#result_athletes").removeClass("hide");
        }

      } else {
        showMessage(request.mensagem);
        teamsList("hide");
        loading("hide");
        $("#result_athletes").removeClass("hide");
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

function formatPontuacaoAtletas() {
  $(".athlete_pontos").each(function() {
    if ($(this).html() != "0.00") {
      if ($(this).html().indexOf("-") == 0) {
        $(this).addClass("negativo");
      } else if ($(this).html().indexOf("-") == -1) {
        $(this).addClass("positivo");
      }
    }
  });
}

function formatPontuacaoTime() {
  var $pts_label = $(".pontos-total");
  if ($pts_label.html().indexOf("-") == 0) {
    $pts_label.addClass("negativo");
  } else if ($pts_label.html().indexOf("-") == -1) {
    $pts_label.addClass("positivo");
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
  var $lista_atletas = $("#team_escalacao table"),
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

      var athletes = request.atletas,
          athletes_rows = "<tbody>";

      if (typeof athletes !== "undefined" && request.athletes != "") {

        $.each(athletes, function(inc, athlete) {

          // atleta existe
          if (athlete.apelido != "") {

            // escudo clube
            var athlete_clube_escudo = "", clube_escudo45x45 = "";
            if (athlete.clube_id != 1) {
              clube_escudo45x45 = request.clubes[athlete.clube_id].escudos['45x45'];
              if (typeof clube_escudo45x45 !== "undefined" && clube_escudo45x45 !== "") {
                athlete_clube_escudo = "<img src='"+ clube_escudo45x45 +"'>";
              }
            }

            // atleta foto
            var athlete_foto = athlete.foto, athlete_foto140x140 = "";
            if (athlete_foto !== "" && athlete_foto !== null) {
              athlete_foto140x140 = "<img src='"+ athlete_foto.replace("FORMATO", "140x140") +"'>";
            } else {
              athlete_foto140x140 = "<img src='images/foto-jogador.svg'>";
            }

            // atleta info
            var athlete_nome = (athlete.apelido == "" ? "-" : athlete.apelido.toUpperCase()),
                athlete_posicao = request.posicoes[athlete.posicao_id].nome.toUpperCase();

            // athlete pontuacao
            var athlete_pontuacao = athlete.pontuacao.toFixed(2);

            athletes_rows += " \
            <tr> \
              <td> \
                <div class='athlete_clube'>"+ athlete_clube_escudo +"</div> \
                <div class='athlete_foto'>"+ athlete_foto140x140 +"</div> \
              </td> \
              <td class='athlete_nome_posicao'> \
                <span class='athlete_nome_label'>"+ athlete_nome +"</span> \
                <span class='athlete_posicao_label'>"+ athlete_posicao +"</span> \
              </td> \
              <td class='athlete_pontos'>"+ athlete_pontuacao +"</td> \
            </tr> \
            ";

          }
        });

        $lista_atletas.append(athletes_rows).show();
        $rodada_atual.html(request.rodada + "ª Rodada");

        formatPontuacaoAtletas();

      } else {

        if (typeof request.mensagem !== "undefined" && request.mensagem !== "") {
          message = request.mensagem;
        } else {
          message = "A escalação desse time ainda não pode ser exibida.";
        }
        showMessage(message, "info");
        $lista_atletas.append(atletas_rows).show();
        $rodada_atual.addClass("hide");
        loading("hide");
        return false;
      }

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
  $("#team_escalacao table").html("").append("<tr><td class='text-center msg "+ msg_type +"'>"+ message +"</td></tr>");
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
          $("#result_athletes .table").append("<tr id='nenhum-jogador'><td class='text-center info'>Nenhum jogador encontrado.</td></tr>");
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
mercado_pos_rodada = true;

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

statusMercado();
