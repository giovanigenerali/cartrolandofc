/* Cartrolando FC - http://cartrolandofc.com
 * https://github.com/wgenial/cartrolandofc
 * Desenvolvido por WGenial - http://wgenial.com.br
 * License: MIT <http://opensource.org/licenses/mit-license.php> - see LICENSE file
 */

// Notificacao
function notify(message, type) {

  var msg_type = "info"; // success, info, warning and danger.

  if (typeof type !== "undefined" && type !== "") {

    msg_type = type;

  }

  $(".alert").remove();

  $("<div class='text-center alert alert-" + msg_type + "'>" + message + "</div>").insertAfter(".jumbotron");

}


// Loading
function loading(status) {

  if (status == "show") {

    $("<div id='loading' class='row'><img src='images/loading.gif'></div>").insertAfter(".jumbotron");

  } else if (status == "hide") {

    $("#loading").remove();

  }

}


// Formata o status do mercado
function formatMercadoStatus() {

  var $mercado_status_wrapper = $("#mercado_status");

  $mercado_status_wrapper
    .html(dic.mercado_status[mercado_status].text)
    .addClass(dic.mercado_status[mercado_status].type)
    .show();

}


// Formata a rodada atual
function formatRodadaAtual() {

  var $rodada_atual_wrapper = $("#rodada_atual");

  $rodada_atual_wrapper.html("Rodada " + rodada_atual).show();

}


// Retorna a class css dado um tipo de numero
function getClassNumber(number) {

  return ((number > 0) ? "positivo" : ((number < 0) ? "negativo" : "neutro"));

}

// Retorna a class css com seta up/down dado um tipo de numero
function getClassArrowNumber(number) {

  return ((number > 0) ? "positivo arrow-up" : ((number < 0) ? "negativo arrow-down" : "neutro"));

}

// Buscar atletas dentro da escalacao
function searchAthlete() {

  var $athlete_name = $(".athlete_apelido_label");

  $("#atleta").unbind("keyup");

  if ($athlete_name.size() > 0) {

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

        $(".alert").remove();

        $.each($athlete_name, function() {

          if ($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) == -1) {

            $(this).parents(".athlete_wrapper").hide();

          } else {

            $(this).parents(".athlete_wrapper").show();

            inc++;
          }

        });

        if (inc == 0) {

          notify(notify_msg.athlete_notfound.text, notify_msg.athlete_notfound.type);

        } else {

          $(this).parents(".athlete_wrapper").show();

        }

      });
  }

}


// Busca pontuacao parciais da rodada atual
function getParciaisRodada() {

  return $.ajax({
    type: "GET",
    contentType: "application/json",
    dataType: "json",
    timeout: 10000,
    url: "load-api.php?api=parciais-atletas",
    success: function(data) {
      console.info("["+ new Date() +"] parciais-atletas: updated");
      return data;
    }
  });

}


// Define os atletas pontuados da rodada atual
function loadParciaisRodada() {

  // terminou a chamada da busca pontuacao parciais da rodada atual
  getParciaisRodada().done(function(result) {

    // define os atletas pontuados
    atletas_pontuados = result.atletas;

  });

}


// Busca status do mercado e rodada atual
function getMercadoRodada() {

  return $.ajax({
    type: "GET",
    contentType: "application/json",
    dataType: "json",
    timeout: 10000,
    url: "load-api.php?api=mercado-status",
    beforeSend: function() {
      $("#status_rodada_mercado").append("<img id='loading-bubbles' src='images/loading-bubbles.svg'>");
    },
    success: function(data) {
      return data;
    }
  });

}


// Define o status do mercado, rodada atual
function loadMercadoRodada() {

  // terminou a chamada da leitura do mercado e rodada
  getMercadoRodada().done(function(result) {

    // define o status do mercado
    mercado_status = result.status_mercado;

    // chama formatacao do status do mercado
    formatMercadoStatus();

    // define a rodada atual
    rodada_atual = result.rodada_atual;

    // chama formatacao da rodada atual
    formatRodadaAtual();

    // Botoes para consultar e/ou atualizar pontuacao parciais da rodada atual
    // se mercado nao estiver encerado
    if (mercado_status != 6) {
      $("#load-pontuacao").show();
      $("#load-pontuacao, #refresh-pontuacao").on("click", function() {
        getScoresCurrentRound();
      });
    }

    // remove loading
    $("#loading-bubbles").remove();

  });

}


// Buscar times
function searchTeam() {

  var $team_input = $("#team-name"),
    team_name = decodeURI($team_input.val()).toLowerCase();

  // nome do time está vazio
  if (team_name === "") {

    // esconde o dropdown de times
    $("#teams_list").hide();

    // esconde as informacoes do time e atletas
    $("#result").hide();

    // exibe mensagem
    notify(notify_msg.team_empty.text, notify_msg.team_empty.type);

    return false;

  }
  // nome do time foi informado
  else {

    // efetua chamada na API
    $.ajax({
      type: "GET",
      contentType: "application/json",
      timeout: 10000,
      url: "load-api.php",
      data: {
        api: "busca-time",
        team: team_name
      },
      beforeSend: function() {

        // exibe o loading
        loading("show");

        // remove o banner de mensagem
        $(".alert").remove();

        // esconde o dropdown de times
        $("#teams_list").hide();

        // esconde as informacoes do time e atletas
        $("#result").hide();

      },
      success: function(teams) {

        var teams_total = teams.length;

        // nenhum time foi não encontrado
        if (teams_total == 0) {

          // esconde o dropdown de times
          $("#teams_list").hide();

          // esconde as informacoes do time e atletas
          $("#result").hide();

          // exibe mensagem
          notify(notify_msg.team_notfound.text, notify_msg.team_notfound.type);

          return false;

        }
        // lista todos os times encontrados
        else if (teams_total > 1) {

          // exibe o dropdown de times
          dropdownTeams(teams, teams_total);

        }
        // carrega as informacoes do time e atletas
        else {

          var team = teams[0];

          // carrega as infos do time
          teamInfo(team);

        }

      },
      complete: function() {

        // esconde o loading, já carregou.
        loading("hide");

      },
      error: function() {

        // esconde o dropdown de times
        $("#teams_list").hide();

        // esconde as informacoes do time e atletas
        $("#result").hide();

        // exibe mensagem
        notify(notify_msg.team_error.text, notify_msg.team_error.type);

        return false;

      }

    });

  }

}


// Dropdown de times
function dropdownTeams(teams, teams_total) {

  var teams_arr = teams,
    $team_input = $("#team-name"),
    $teams_list = $("#teams_list"),
    teams_list = teams;

  // limpa o conteudo do container
  $teams_list.html("");

  // esconde o dropdown
  $teams_list.hide();

  // monta o dropdown
  var wrapper = "<ul class='teams'>";

  for (var i = 0; i < teams_list.length; i++) {

    var team_slug = teams_list[i].slug,
      team_nome = teams_list[i].nome,
      team_cartoleiro = teams_list[i].nome_cartola;

    wrapper += " \
	  <li data-inc='" + i + "' data-slug='" + team_slug + "' data-nome='" + team_nome + "'> \
      <div class='nome'>" + team_nome + "</div> \
      <div class='cartola'>" + team_cartoleiro + "</div> \
	  </li>";

  }

  wrapper += "</ul>";

  // insere a lista de times no container
  $teams_list.append(wrapper);

  // cria evento click para cada time do drowpdown
  $teams_list.find("li").on("click", function() {

    // esconde o dropdown de times
    $("#teams_list").hide();

    // insere no input nome do time o nome do time que foi clicado para carregar
    $team_input.val("").val($(this).data("nome"));

    // carrega as info. do time
    var team = teams_list[$(this).data("inc")];
    teamInfo(team);

  });

  // exibe o dropdown
  $teams_list.show().scrollTop(0);

}


// Carrega informacoes do time
function teamInfo(team) {

  var $team_info_wrapper = $("#team_info_wrapper"),
      $team_nome = $(".team_nome"),
      team_nome = (team.nome != "") ? team.nome : "",
      team_cartola = (team.nome_cartola != "") ? team.nome_cartola : "";

  // time nome / cartola nome
  $team_nome.html("<h1>" + team_nome + "</h1><h3>" + team_cartola + "</h3>");

  // exibe informacoes do time
  $team_info_wrapper.show();


  // se mercado fechado
  if (mercado_status == 2) {

    // chama a funcao para a definicao dos atletas pontuados da rodada atual
    getParciaisRodada().done(function(result) {

      // define os atletas pontuados
      atletas_pontuados = result.atletas;

      // Lista atletas via [slug do time]
      getAthletes(team.slug);

    });

  } else {

    // Lista atletas via [slug do time]
    getAthletes(team.slug);

  }

}


// Lista atletas do time
function getAthletes(team_slug) {

  var $team_input = $("#team-name"),

    $result = $("#result"),

    $team_patrimonio = $(".team_patrimonio"),
    $team_rodada = $(".team_rodada"),
    $team_pontuacao = $(".team_pontuacao"),

    $team_escalacao = $("#team_escalacao");

  $.ajax({
    type: "GET",
    contentType: "application/json",
    timeout: 10000,
    url: "load-api.php",
    data: {
      api: "busca-atletas",
      team_slug: team_slug
    },
    beforeSend: function() {

      // exibe o loading
      loading("show");

      // esconde as informacoes do time e atletas
      $result.hide();

      // limpa as informacoes do time
      $team_patrimonio.html("");
      $team_rodada.html("");
      $team_pontuacao.html("");

      // limpa as informacoes dos atletas
      $team_escalacao.html("");

    },
    success: function(request) {

      // sem atletas, exibe mensagem de retorno da API
      if (typeof request.mensagem !== "undefined") {

        // esconde as informacoes do time e atletas
        $result.hide();

        // exibe mensagem
        notify(request.mensagem, "info");

        return false;

      }
      // tem retorno da API
      else {

        // time escudo
        var team = request.time;
        $team_escudo = $("#team_escudo"),
        team_escudo = (team.url_escudo_svg != "") ? "<img src=" + team.url_escudo_svg + ">" : "";
        $team_escudo.html(team_escudo);

        var athletes = request.atletas;

        // tem retorno de atletas da API
        if (typeof athletes !== "undefined" && athletes != "") {

          // pontuacao total do time, inicia zerada.
          var team_pontuacao = 0;

          // loop nos atletas
          $.each(athletes, function(inc, athlete) {

            // atleta tem info para exibir
            if (athlete.apelido != "") {

              /*********************************************************/
              // escudo clube
              var athlete_clube_escudo = "",
                clube_escudo45x45 = "";
              // se o clube_id for diferente de 1, que é 'outros' na API, exibe o escudo do time.
              if (athlete.clube_id != 1 && athlete.clube_id !== null) {
                clube_escudo45x45 = request.clubes[athlete.clube_id].escudos['45x45'];
                if (typeof clube_escudo45x45 !== "undefined" && clube_escudo45x45 !== "") {
                  athlete_clube_escudo = "<img src='" + clube_escudo45x45 + "'>";
                }
              }
              // clube_id é igual a 1 (outros), exibe escudo fallback.
              else {
                athlete_clube_escudo = "<img src='images/emptystate_escudo.svg'>";
              }
              /*********************************************************/

              /*********************************************************/
              // athlete foto
              var atleta_foto = athlete.foto,
                atleta_foto140x140 = "";

              if (atleta_foto !== "" && atleta_foto !== null) {
                atleta_foto140x140 = "<img src='" + atleta_foto.replace("FORMATO", "140x140") + "'>";
              } else {
                atleta_foto140x140 = "<img src='images/foto-jogador.svg'>";
              }
              /*********************************************************/

              /*********************************************************/
              // athlete apelido
              var athlete_apelido = athlete.apelido;
              /*********************************************************/

              /*********************************************************/
              // athlete status
              var athlete_status_id = athlete.status_id,
                  athlete_status_label = request.status[athlete_status_id].nome,
                  athlete_status_image = "";

              // se status não for nulo
              if (athlete_status_id != 6) {
                athlete_status_image = "<img src='images/status_"+ athlete_status_id +".png'>";
              }
              /*********************************************************/


              /*********************************************************/
              // athlete posicao
              var athlete_posicao = request.posicoes[athlete.posicao_id].nome;
              /*********************************************************/

              /*********************************************************/
              // athlete preco
              var athlete_preco = athlete.preco_num.toFixed(2);
              /*********************************************************/

              /*********************************************************/
              // athlete preco variacao
              var athlete_preco_variacao = athlete.variacao_num.toFixed(2);
              athlete_preco_variacao = athlete_preco_variacao.replace("-","");
              var athlete_preco_variacao_css = getClassArrowNumber(athlete.variacao_num);
              /*********************************************************/

              /*********************************************************/
              // atletas pontuacao
              var athlete_pontos,
                  athlete_pontos_css,
                  athlete_pontos_label = (mercado_status == 1) ? dic.athlete_score_last.text : dic.athlete_score_current.text;

              // mercado fechado, pega pontuacao dos atletas da rodada em andamento
              if (mercado_status == 2) {

                athlete_pontos = (typeof atletas_pontuados !== "undefined" && typeof atletas_pontuados[athlete.atleta_id] !== "undefined") ? atletas_pontuados[athlete.atleta_id].pontuacao.toFixed(2) : "-";
                athlete_pontos_css = getClassNumber(athlete_pontos);

                // calcula a pontuacao do time
                team_pontuacao += (typeof atletas_pontuados !== "undefined" && typeof atletas_pontuados[athlete.atleta_id] !== "undefined") ? atletas_pontuados[athlete.atleta_id].pontuacao : 0.00;

                // mercado aberto, pega pontuacao dos atletas da rodada anterior
              } else if (mercado_status == 1) {

                athlete_pontos = athlete.pontos_num.toFixed(2);
                athlete_pontos_css = getClassNumber(athlete.pontos_num);

                // fallback, atleta sem pontuacao
              } else {
                athlete_pontos = "-";
              }
              /*********************************************************/

              /*********************************************************/
              // athlete media pontos
              var athlete_media = athlete.media_num.toFixed(2);
              var athlete_media_css = getClassNumber(athlete.media_num);
              /*********************************************************/

              /*********************************************************/
              // athlete jogos
              var athlete_jogos = athlete.jogos_num;
              /*********************************************************/

              var athlete_row = " \
              <div id='"+ athlete.atleta_id +"' class='row athlete_wrapper'> \
                <div class='athlete_clube'>" + athlete_clube_escudo + "</div> \
                <div class='athlete_foto'>" + atleta_foto140x140 + "</div> \
                <div class='athlete_apelido_label'> \
                  <span>" + athlete_apelido + "</span> \
                  <span class='athlete_status' data-toggle='tooltip' data-placement='bottom' title='"+ athlete_status_label +"'>"+ athlete_status_image +"</span> \
                </div> \
                <div class='athlete_posicao_label'>" + athlete_posicao + "</div> \
                <div class='statistics_wrapper'> \
                  <div class='statistics'> \
                    <span class='athlete_val'>C$ "+ athlete_preco +"</span> \
                    <span class='athlete_label'>Preço</span> \
                  </div> \
                  <div class='statistics'> \
                    <span class='athlete_val "+ athlete_preco_variacao_css +"'>"+ athlete_preco_variacao +"</span> \
                    <span class='athlete_label' title='Variação (C$)'>Var.(C$)</span> \
                  </div> \
                  <div class='statistics'> \
                    <span class='athlete_val "+ athlete_media_css +"'>"+ athlete_media +"</span> \
                    <span class='athlete_label' title='Pontuação média'>Média</span> \
                  </div> \
                  <div class='statistics "+ ((mercado_status == 6) ? 'hide' : '') +"'> \
                    <span class='athlete_val " + athlete_pontos_css + "'>" + athlete_pontos + "</span> \
                    <span class='athlete_label'>"+ athlete_pontos_label +"</span> \
                  </div> \
                  <div class='statistics'> \
                    <span class='athlete_val'>"+ athlete_jogos +"</span> \
                    <span class='athlete_label'>Jogos</span> \
                  </div> \
                </div> \
              </div>";

              $(athlete_row).appendTo($team_escalacao);

            }

          });

          // rodada
          var team_rodada = (mercado_status == 1) ? athletes[0].rodada_id : rodada_atual;
          $team_rodada.html("Rodada " + team_rodada);

          // se o mercado está fechado, pega pontuacao do time da rodada anterior
          if (mercado_status == 1) {
            // se a pontuacao for diferente de null, carrega da rodada anterior, caso contrario mostra zerada.
            team_pontuacao = (request.pontos !== null) ? request.pontos : team_pontuacao;
          }

          // time pontuacao
          var team_pontuacao_css = getClassNumber(team_pontuacao);

          // pontuacao label
          var pontuacao_label = (mercado_status == 1) ? dic.score_last.text : dic.score_current.text;

          $team_pontuacao.html("<div class='pontos_total " + team_pontuacao_css + "'>" + team_pontuacao.toFixed(2) + "</div> <div class='pontuacao_label'>" + pontuacao_label + "</div>");

          // time patrimonio
          var team_patrimonio = request.patrimonio;
          $team_patrimonio.html("<div class='patrimonio-total'>C$ " + team_patrimonio.toFixed(2) + "</div> <div class='patrimonio-label'>Patrimônio</div>");

        }
        // nao tem retorno de atletas da API
        else {

          // esconde as informacoes do time e atletas
          $result.hide();

          // exibe mensagem
          notify(notify_msg.athletes_notfound.text, notify_msg.athletes_notfound.type);

          return false;

        }

      }

    },
    complete: function() {

      // esconde o loading
      loading("hide");

      // exibe o resultado
      $result.show();

      // tooltip
      $('[data-toggle="tooltip"]').tooltip();

    },
    error: function() {

      // esconde o loading
      $result.hide();

      // exibe mensagem
      notify(notify_msg.athletes_error.text, notify_msg.athletes_error.type);

      return false;

    }
  });
}


// Lista pontuacao parcial de todos os atletas na rodada atual
function getScoresCurrentRound() {

  var $search_atleta = $("#search-atleta"),
    $btn_load_pontuacao = $("#load-pontuacao"),
    $btn_refresh_pontuacao = $("#refresh-pontuacao"),

    $result = $("#result"),

    $team_escalacao = $("#team_escalacao");

  $.ajax({
    type: "GET",
    contentType: "application/json",
    timeout: 10000,
    url: "load-api.php",
    data: {
      api: "parciais-atletas"
    },
    beforeSend: function() {

      // exibe o loading
      loading("show");

      // esconde as informacoes do time e atletas
      $result.hide();

      // limpa as informacoes dos atletas
      $team_escalacao.html("");

      // esconde a busca de atletas e limpa o input
      $search_atleta.find("#atleta").val("");

    },
    success: function(request) {

      // sem retorno da API
      if (typeof request == "undefined") {

        // esconde as informacoes do time e atletas
        $result.hide();

        // exibe mensagem
        notify(notify_msg.athletes_round_error.text, notify_msg.athletes_round_error.type);

        return false;

      }
      // tem retorno da API
      else {

        athletes = request.atletas;

        // tem retorno de atletas da API
        if (typeof athletes !== "undefined" && athletes != "") {

          // loop nos atletas
          $.each(athletes, function(inc, athlete) {

            // atleta tem info para exibir
            if (athlete.apelido != "") {

              /*********************************************************/
              // escudo clube
              var athlete_clube_escudo = "",
                clube_escudo45x45 = "";
              // se o clube_id for diferente de 1, que é 'outros' na API, exibe o escudo do time.
              if (athlete.clube_id != 1 && athlete.clube_id !== null) {
                clube_escudo45x45 = request.clubes[athlete.clube_id].escudos['45x45'];
                if (typeof clube_escudo45x45 !== "undefined" && clube_escudo45x45 !== "") {
                  athlete_clube_escudo = "<img src='" + clube_escudo45x45 + "'>";
                }
              }
              // clube_id é igual a 1 (outros), exibe escudo fallback.
              else {
                athlete_clube_escudo = "<img src='images/emptystate_escudo.svg'>";
              }
              /*********************************************************/

              /*********************************************************/
              // atletas foto
              var atleta_foto = athlete.foto,
                atleta_foto140x140 = "";

              if (atleta_foto !== "" && atleta_foto !== null) {
                atleta_foto140x140 = "<img src='" + atleta_foto.replace("FORMATO", "140x140") + "'>";
              } else {
                atleta_foto140x140 = "<img src='images/foto-jogador.svg'>";
              }
              /*********************************************************/

              /*********************************************************/
              // atleta posicao
              var athlete_posicao = request.posicoes[athlete.posicao_id].nome;
              /*********************************************************/

              /*********************************************************/
              // atleta apelido
              var athlete_apelido = athlete.apelido;
              /*********************************************************/

              /*********************************************************/
              // atletas pontuacao
              var athlete_pontos = athlete.pontuacao.toFixed(2),
                  athlete_pontos_css = getClassNumber(athlete.pontuacao);
              /*********************************************************/

              var athlete_row = " \
              <div id='"+ athlete.atleta_id +"' class='row athlete_wrapper'> \
                <div class='athlete_clube'>" + athlete_clube_escudo + "</div> \
                <div class='athlete_foto'>" + atleta_foto140x140 + "</div> \
                <div class='athlete_apelido_label'>" + athlete_apelido + "</div> \
                <div class='athlete_posicao_label'>" + athlete_posicao + "</div> \
                <div class='statistics_wrapper'> \
                  <div class='statistics'> \
                    <span class='athlete_val " + athlete_pontos_css + "'>" + athlete_pontos + "</span> \
                    <span class='athlete_label'>"+ dic.athlete_score_current.text +"</span> \
                  </div> \
                </div> \
              </div>";

              $(athlete_row).appendTo($team_escalacao);

            }

          });

        }
        // nao tem retorno de atletas da API
        else {

          // esconde as informacoes do time e atletas
          $result.hide();

          // exibe mensagem
          if (typeof request.mensagem !== "undefined") {
            notify(request.mensagem, "info");
          } else {
            notify(notify_msg.athletes_round_error.text, notify_msg.athletes_round_error.type);
          }

          return false;

        }

      }

    },
    complete: function() {

      // esconde o loading
      loading("hide");

      // exibe as informacoes do time e atletas
      $result.show();

      // exibe a busca de atletas
      $search_atleta.removeClass("hide");

      // exibe a busca por atleta
      searchAthlete();

      // esconde o botao de consulta
      $btn_load_pontuacao.hide();

      // exibe o botao de atualizacao
      $btn_refresh_pontuacao.removeClass("hide");

    },
    error: function() {

      // esconde o loading
      $result.hide();

      // exibe mensagem
      notify(notify_msg.athletes_error.text, notify_msg.athletes_error.type);

      return false;

    }

  });

}


// Lista estatisticas de todos os atletas
function getStatisticsAthletes() {

  var $search_atleta = $("#search-atleta"),
    $btn_load_estatitiscas = $("#load-atletas-estatisticas"),
    $result = $("#result"),
    $team_escalacao = $("#team_escalacao");

  $.ajax({
    type: "GET",
    contentType: "application/json",
    timeout: 10000,
    url: "load-api.php",
    data: {
      api: "atletas-mercado"
    },
    beforeSend: function() {

      // exibe o loading
      loading("show");

      // esconde as informacoes dos atletas
      $result.hide();

      // limpa as informacoes dos atletas
      $team_escalacao.html("");

      // esconde a busca de atletas e limpa o input
      $search_atleta.find("#atleta").val("");

    },
    success: function(request) {

      // sem retorno da API
      if (typeof request == "undefined") {

        // esconde as informacoes do time e atletas
        $result.hide();

        // exibe mensagem
        notify(notify_msg.athletes_round_error.text, notify_msg.athletes_round_error.type);

        return false;

      }
      // tem retorno da API
      else {

        athletes = request.atletas;

        // tem retorno de atletas da API
        if (typeof athletes !== "undefined" && athletes != "") {

          // loop nos atletas
          $.each(athletes, function(inc, athlete) {

            // atleta tem info para exibir
            if (athlete.apelido != "") {

              /*********************************************************/
              // escudo clube
              var athlete_clube_escudo = "",
                clube_escudo45x45 = "";
              // se o clube_id for diferente de 1, que é 'outros' na API, exibe o escudo do time.
              if (athlete.clube_id != 1 && athlete.clube_id !== null) {
                clube_escudo45x45 = request.clubes[athlete.clube_id].escudos['45x45'];
                if (typeof clube_escudo45x45 !== "undefined" && clube_escudo45x45 !== "") {
                  athlete_clube_escudo = "<img src='" + clube_escudo45x45 + "'>";
                }
              }
              // clube_id é igual a 1 (outros), exibe escudo fallback.
              else {
                athlete_clube_escudo = "<img src='images/emptystate_escudo.svg'>";
              }
              /*********************************************************/

              /*********************************************************/
              // athlete foto
              var atleta_foto = athlete.foto,
                atleta_foto140x140 = "";

              if (atleta_foto !== "" && atleta_foto !== null) {
                atleta_foto140x140 = "<img src='" + atleta_foto.replace("FORMATO", "140x140") + "'>";
              } else {
                atleta_foto140x140 = "<img src='images/foto-jogador.svg'>";
              }
              /*********************************************************/

              /*********************************************************/
              // athlete apelido
              var athlete_apelido = athlete.apelido;
              /*********************************************************/

              /*********************************************************/
              // athlete posicao
              var athlete_posicao = request.posicoes[athlete.posicao_id].nome;
              /*********************************************************/

              /*********************************************************/
              // athlete preco
              var athlete_preco = athlete.preco_num.toFixed(2);
              /*********************************************************/

              /*********************************************************/
              // athlete preco variacao
              var athlete_preco_variacao = athlete.variacao_num.toFixed(2);
              athlete_preco_variacao = athlete_preco_variacao.replace("-","");
              var athlete_preco_variacao_css = getClassArrowNumber(athlete.variacao_num);
              /*********************************************************/

              /*********************************************************/
              // athlete pontos
              var athlete_pontos = athlete.pontos_num.toFixed(2);
              var athlete_pontos_css = getClassNumber(athlete.pontos_num);
              /*********************************************************/

              /*********************************************************/
              // athlete media pontos
              var athlete_media = athlete.media_num.toFixed(2);
              var athlete_media_css = getClassNumber(athlete.media_num);
              /*********************************************************/

              /*********************************************************/
              // athlete jogos
              var athlete_jogos = athlete.jogos_num;
              /*********************************************************/

              var athlete_row = " \
              <div id='"+ athlete.atleta_id +"' class='row athlete_wrapper'> \
                <div class='athlete_clube'>" + athlete_clube_escudo + "</div> \
                <div class='athlete_foto'>" + atleta_foto140x140 + "</div> \
                <div class='athlete_apelido_label'>" + athlete_apelido + "</div> \
                <div class='athlete_posicao_label'>" + athlete_posicao + "</div> \
                <div class='statistics_wrapper'> \
                  <div class='statistics'> \
                    <span class='athlete_val'>C$ "+ athlete_preco +"</span> \
                    <span class='athlete_label'>Preço</span> \
                  </div> \
                  <div class='statistics'> \
                    <span class='athlete_val "+ athlete_preco_variacao_css +"'>"+ athlete_preco_variacao +"</span> \
                    <span class='athlete_label' title='Variação (C$)'>Var.(C$)</span> \
                  </div> \
                  <div class='statistics'> \
                    <span class='athlete_val "+ athlete_media_css +"'>"+ athlete_media +"</span> \
                    <span class='athlete_label' title='Pontuação média'>Média</span> \
                  </div> \
                  <div class='statistics "+ ((mercado_status == 6) ? 'hide' : '') +"'> \
                    <span class='athlete_val " + athlete_pontos_css + "'>" + athlete_pontos + "</span> \
                    <span class='athlete_label' title='Última pontuação'>Última</span> \
                  </div> \
                  <div class='statistics'> \
                    <span class='athlete_val'>"+ athlete_jogos +"</span> \
                    <span class='athlete_label'>Jogos</span> \
                  </div> \
                </div> \
              </div>";

              $(athlete_row).appendTo($team_escalacao);

            }

          });

        }
        // nao tem retorno de atletas da API
        else {

          // esconde as informacoes do time e atletas
          $result.hide();

          // exibe mensagem
          notify(notify_msg.athletes_error.text, notify_msg.athletes_error.type);

          return false;

        }

      }

    },
    complete: function() {

      // esconde o loading
      loading("hide");

      // exibe as informacoes do time e atletas
      $result.show();

      // exibe a busca de atletas
      $search_atleta.removeClass("hide");

      // exibe a busca por atleta
      searchAthlete();

      // esconde o botao de consulta
      $btn_load_estatitiscas.hide();

    },
    error: function() {

      // esconde o loading
      $result.hide();

      // exibe mensagem
      notify(notify_msg.athletes_error.text, notify_msg.athletes_error.type);

      return false;

    }

  });

}

// Inicializacao
function init() {

  // Vars
  atletas_pontuados = null;
  rodada_atual = 0;
  mercado_status = 0;
  team = null;
  athletes = null;
  dic = {
    'score_current': {
      'text': 'Pontuação Parcial'
    },
    'score_last': {
      'text': 'Pontuação'
    },
    'mercado_status': {
      1: {
        'text': 'Mercado aberto!',
        'type': 'aberto'
      },
      2: {
        'text': 'Mercado fechado!',
        'type': 'fechado'
      },
      3: {
        'text': 'Mercado em atualização!',
        'type': 'atualizacao'
      },
      4: {
        'text': 'Mercado em manutenção!',
        'type': 'manutencao'
      },
      6: {
        'text': 'Final de temporada',
        'type': 'encerrado'
      }
    },
    'athlete_score_current': {
      'text': 'Parcial'
    },
    'athlete_score_last': {
      'text': 'Última'
    },
    'esquema_tatico': {
      1: '3-4-3',
      2: '3-5-2',
      3: '4-3-3',
      4: '4-4-2',
      5: '4-5-1',
      6: '5-3-2',
      7: '5-4-1'
    }
  };
  notify_msg = {
    'team_empty': {
      'text': 'Digite o nome do seu time para consultar!',
      'type': 'warning'
    },
    'team_notfound': {
      'text': 'O time que você digitou não foi encontrado, verifique se o nome está correto!',
      'type': 'info'
    },
    'team_error': {
      'text': 'Ocorreu algum erro ao consultar seu time!<br> Aguarde alguns instantes para uma nova consulta.',
      'type': 'danger'
    },
    'athletes_notfound': {
      'text': 'A escalação desse time ainda não pode ser exibida.',
      'type': 'info'
    },
    'athletes_error': {
      'text': 'Ocorreu algum erro ao consultar a lista de jogadores!<br> Aguarde alguns instantes para uma nova consulta.',
      'type': 'danger'
    },
    'athletes_round_error': {
      'text': 'Ocorreu algum erro ao consultar os atletas da rodada atual!<br> Aguarde alguns instantes para uma nova consulta.',
      'type': 'danger'
    },
    'athlete_notfound': {
      'text': 'Nenhum jogador foi encontrado com esse termo.',
      'type': 'info'
    }
  };

  // Efetua a leitura do status do mercado e rodada atual
  loadMercadoRodada();

  // Botao para pesquisar time
  $("#search-team").on("click", function() {
    searchTeam();
  });

  // Input para buscar time ao pressionar enter
  $("#team-name").keypress(function(e) {
    if (e.which == 13) {
      searchTeam();
    }
  });

}

// document ready, then init.
$(function() {
  init();
});
