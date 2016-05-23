$(document).ready(function() {

  function getPontuacaoAtletas() {
    var $lista_atletas = $(".team_escalacao table"), $rodada_atual = $(".rodada-atual");

    $.ajax({
      type: "GET",
      contentType: "application/json",
      cache: false,
      url: "load-api.php",
      data: {
        api: "parciais-atletas"
      },
      beforeSend: function() {
        $rodada_atual.html("").hide();
        $lista_atletas.html("").hide();
        loading("show");
        $("#search").addClass("hide");
      },
      success: function(request) {

        if (request.length == 0) {
          alert("Ocorreu algum erro ao consultar a pontuação dos jogadores! Tente novamente ou aguarde alguns instantes para uma nova consulta...");
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
              atleta_foto80x80 = "<img class='img-circle' src='"+ atleta_foto.replace("FORMATO", "80x80") +"'>";
            }

            // athlete pontuacao
            var atleta_pontuacao = atleta.pontuacao;

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
          $rodada_atual.html(request.rodada + "ª Rodada").show();

        } else {

          var message = "";
          if (typeof request.mensagem !== "undefined" && request.mensagem !== "") {
            message = request.mensagem;
          } else {
            message = "A escalação desse time ainda não pode ser exibida.";
          }
          atletas_rows += "<tr><td class='text-center'>"+ message +"</td></tr>";
          $lista_atletas.append(atletas_rows).show();
          $rodada_atual.html("").hide();
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
        $("#search").removeClass("hide");
        searchRows();
      },
      error: function (error) {
        alert("Ocorreu algum erro ao consultar os atletas da rodada atual! Tente novamente ou aguarde alguns instantes para uma nova consulta...");
        loading("hide");
        $("#search").addClass("hide");
        $rodada_atual.html("").hide();
        $lista_atletas.html("").hide();
        return false;
      }
    });
  }
  getPontuacaoAtletas();

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
          $.each($tbody.find("tr"), function() {
            if ($(this).text().toLowerCase().indexOf($(_this).val().toLowerCase()) == -1) {
              $(this).hide();
            } else {
              $(this).show();
            }
          });
          if ($(_this).val() === "") {
          }
        });

    } else {
      $("#search").addClass("hide");
    }
  }

});
