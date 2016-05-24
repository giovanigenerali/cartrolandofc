$(document).ready(function() {

  function searchTeam() {
    var $team_input = $("#team"),
        team_name = decodeURI($team_input.val()).toLowerCase();

    if (team === "") {
      alert("Digite o nome do seu time para consultar!");
      $team_input.focus();
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
        teamsList("hide");
      },
      success: function(teams) {
        var teams_total = teams.length;

        if (teams_total == 0) {
          alert("O time que você digitou não foi encontrado, verifique se o nome está correto!");
          $team_input.focus();
          loading("hide");
          return false;
        } else if (teams_total > 1) {
          showTeamsList(teams, teams_total);
        } else {
          var team_slug = teams[0].slug;
          getAthletes(team_slug);
        }
      },
      complete: function() {
        loading("hide");
      },
      error: function () {
        alert("Ocorreu algum erro ao consultar seu time!\n Aguarde alguns instantes para uma nova consulta.");
        $team_input.focus();
        loading("hide");
        return false;
      }
    });
  }

  function showTeamsList(teams, teams_total) {
    var $team_input = $("#team"),
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
      \n";
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

  function getPontuacao() {
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

  function statusPontuacao() {
    getPontuacao().done(function(result) {
      atletas_pontuados = result.atletas;
      rodada_atual = result.rodada;
    });
  }

  function getAthletes(team_slug) {
    var $team_input = $("#team"),
        $team_escudo = $(".team_escudo"),
        $team_nome = $(".team_nome h1"),
        $team_cartola = $(".team_nome h3"),
        $team_rodada = $(".team_rodada"),
        $team_pontuacao = $(".team_pontuacao"),
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
        $team_escudo.html("");
        $team_nome.html("");
        $team_cartola.html("");
        $team_rodada.html("");
        $team_pontuacao.html("");
        $team_escalacao.html("");

        loading("show");
      },
      success: function(request) {

        if (request.length == 0) {
          alert("Ocorreu algum erro ao consultar a lista de jogadores! Tente novamente ou aguarde alguns instantes para uma nova consulta...");
          $team_input.focus();
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
        if (typeof athletes !== "undefined" && athletes.length > 0) {

          // rodada
          var team_rodada = (typeof rodada_atual !== "undefined") ? rodada_atual : athletes[0].rodada_id;
          if (team_rodada != "") {
            $team_rodada.html(team_rodada + "ª Rodada");
          }

          // rodada label
          var pontuacao_label = (typeof atletas_pontuados !== "undefined") ? "Pontos parciais" : "Pontuação";

          var team_pontuacao = 0;
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

            if (atletas_pontuados !== null && typeof atletas_pontuados !== "undefined" && typeof atletas_pontuados[athlete.atleta_id] !== "undefined") {
              athlete_pontos = atletas_pontuados[athlete.atleta_id].pontuacao.toFixed(2);
              team_pontuacao += atletas_pontuados[athlete.atleta_id].pontuacao;
            } else if (typeof atletas_pontuados === "undefined") {
              athlete_pontos = athlete.pontos_num.toFixed(2);
              team_pontuacao += athlete.pontos_num;
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

        } else {

          var message = "";
          if (typeof request.mensagem !== "undefined" && request.mensagem !== "") {
            message = request.mensagem;
          } else {
            message = "A escalação desse time ainda não pode ser exibida.";
          }
          escalacao_rows += "<tr><td class='text-center'>"+ message +"</td></tr>";
          $team_escalacao.append(escalacao_rows);
          teamsList("hide");
          loading("hide");
          return false;
        }

      },
      complete: function() {
        loading("hide");
        formatPontuacao();
        formatPontuacaoTime();
      },
      error: function (error) {
        alert("Ocorreu algum erro ao consultar os atletas do seu time! Tente novamente ou aguarde alguns instantes para uma nova consulta...");
        $team_input.focus();
        loading("hide");
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
    if ($pts_label.html().indexOf("---") == 0) {
      $pts_label.addClass("neutro");
    } else if ($pts_label.html().indexOf("-") == 0) {
      $pts_label.addClass("negativo");
    } else {
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

  function error(data) {
    var $team_input = $("#team");
    $team_input.focus();
    loading("hide");
    alert(data.error);
  }


  atletas_pontuados = null;
  rodada_atual = 0;

  $("#search").on("click", function() {
    searchTeam();
    statusPontuacao();
  });

  $("#team").keypress(function(e) {
    if (e.which == 13) {
      searchTeam();
      statusPontuacao();
    }
  });

});
