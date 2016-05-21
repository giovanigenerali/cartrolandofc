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
            team = (request.time == "" ? "---" : request.time),
            team_escudo = (team.url_escudo_png == "" ? "---" : team.url_escudo_png),
            team_nome = (team.nome == "" ? "---" : team.nome),
            team_cartola = (team.nome_cartola == "" ? "---" : team.nome_cartola),
            team_patrimonio = (team.patrimonio == "" ? "---" : team.patrimonio),
            escalacao_rows = "<tbody>";

        // team
        $team_escudo.html("<img src="+ team_escudo +">");
        $team_nome.html(team_nome);
        $team_cartola.html(team_cartola);

        // athletes
        if (typeof athletes !== "undefined" && athletes.length > 0) {

          var team_rodada = athletes[0].rodada_id,
              team_pontuacao = (typeof request.pontos === "undefined") ? "" : request.pontos.toFixed(2);

          // rodada
          if (team_rodada != "") {
            $team_rodada.html(team_rodada + "ª Rodada");
          }

          // pontuacao
          if (team_pontuacao != "") {
            $team_pontuacao.html("<span class='pontos-label'>"+ team_pontuacao + "</span> <span class='pontuacao-label'>Pontos parciais</span>");
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

            // athlete
            var athlete_foto = athlete.foto,
                athlete_posicao = request.posicoes[athlete.posicao_id].abreviacao.toUpperCase(),
                athlete_nome = (athlete.apelido == "" ? "---" : athlete.apelido.toUpperCase()),
                athlete_pontos = (athlete.pontos_num == "" ? "---" : athlete.pontos_num.toFixed(2));

            escalacao_rows += " \
            <tr> \
            <td class='athlete_clube'>"+ athlete_clube_escudo +"</td> \
            <td class='athlete_foto'><img class='img-circle' src='"+ athlete_foto.replace("FORMATO", "80x80") +"'></td> \
            <td class='athlete_nome'>"+ athlete_nome +"</td> \
            <td class='athlete_posicao'>"+ athlete_posicao +"</td> \
            <td class='athlete_pontos'>"+ athlete_pontos +"</td> \
            </tr> \
            ";
          });
          $team_escalacao.append(escalacao_rows);
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
      },
      error: function () {
        alert("Ocorreu algum erro ao consultar os atletas do seu time! Tente novamente ou aguarde alguns instantes para uma nova consulta...");
        $team_input.focus();
        loading("hide");
        return false;
      }
    });
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

  $("#search").on("click", function() {
    searchTeam();
  });

  $("#team").keypress(function(e) {
    if (e.which == 13) {
      searchTeam();
    }
  });

});
