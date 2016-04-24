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

        var athletics = request.atletas,
            team = (request.time == "" ? "---" : request.time),
            team_escudo = (team.url_escudo_png == "" ? "---" : team.url_escudo_png),
            team_nome = (team.nome == "" ? "---" : team.nome),
            team_cartola = (team.nome_cartola == "" ? "---" : team.nome_cartola),
            team_patrimonio = (team.patrimonio == "" ? "---" : team.patrimonio),
            team_rodada = (typeof athletics === "undefined") ? "" : athletics[0].rodada_id,
            team_pontuacao = (typeof request.pontos === "undefined") ? "" : request.pontos.toFixed(2),
            escalacao_rows = "<tbody>";

        // team
        $team_escudo.html("<img src="+ team_escudo +">");
        $team_nome.html(team_nome);
        $team_cartola.html(team_cartola);
        if (team_rodada != "") {
          $team_rodada.html(team_rodada + "ª Rodada");
        }
        if (team_pontuacao != "") {
          $team_pontuacao.html("<span class='pontos-label'>"+ team_pontuacao + "</span> <span class='pontuacao-label'>Pontos parciais</span>");
        }

        // athletics
        if (typeof athletics !== "undefined") {

          $.each(athletics, function(inc, athletic) {

            var athletic_clube_escudo = (request.clubes[athletic.clube_id].escudos == null ? "" : request.clubes[athletic.clube_id].escudos),
                athletic_foto = athletic.foto,
                athletic_posicao = request.posicoes[athletic.posicao_id].abreviacao.toUpperCase(),
                athletic_nome = (athletic.apelido == "" ? "---" : athletic.apelido.toUpperCase()),
                athletic_pontos = (athletic.pontos_num == "" ? "---" : athletic.pontos_num.toFixed(2));

            escalacao_rows += " \
            <tr> \
            <td class='athletic_clube'><img src='"+ athletic_clube_escudo['45x45'] +"'></td> \
            <td class='athletic_foto'><img class='img-circle' src='"+ athletic_foto.replace("FORMATO", "80x80") +"'></td> \
            <td class='athletic_nome'>"+ athletic_nome +"</td> \
            <td class='athletic_posicao'>"+ athletic_posicao +"</td> \
            <td class='athletic_pontos'>"+ athletic_pontos +"</td> \
            </tr> \
            ";
          });
          $team_escalacao.append(escalacao_rows);
        } else {
          escalacao_rows += "<tr><td class='text-center'>"+ request.mensagem +"</td></tr>";
          $team_escalacao.append(escalacao_rows);
          teamsList("hide");
          loading("hide");
          return false;
        }


        $(".athletic_pontos").each(function() {
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
