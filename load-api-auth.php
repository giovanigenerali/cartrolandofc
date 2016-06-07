<?php
  /* Cartrolando FC - http://cartrolandofc.com
   * https://github.com/wgenial/cartrolandofc
   * Desenvolvido por WGenial - http://wgenial.com.br
   * License: MIT <http://opensource.org/licenses/mit-license.php> - see LICENSE file
   */

  include 'auth.php';

  header('Content-type: application/json');

  if (isset($_GET["api"]) and $_GET["api"] !== "") {

    // liga
    if ($_GET["api"] === "liga") {
      // $orderBy: campeonato, turno, mes, rodada, patrimonio
      $orderBy = "";
      if (isset($_GET["orderBy"]) && $_GET["orderBy"] != "") {
        $orderBy = "?orderBy=". $_GET["orderBy"];
      }

      // $page: 1, 2, 3...
      $page = "";
      if (isset($_GET["page"]) && $_GET["page"] != "") {
        if (!array_key_exists("orderBy", $_GET)) {
          $page = "?page=". $_GET["page"];
        } else {
          $page = "&page=". $_GET["page"];
        }
      }

      $url = "https://api.cartolafc.globo.com/auth/liga/". $_GET["liga_slug"] . $orderBy . $page;
    }

    // estatisticas e scouts dos atletas
    else if ($_GET["api"] === "atleta-pontuacao") {
      $url = "https://api.cartolafc.globo.com/auth/mercado/atleta/". $_GET["atleta_id"] ."/pontuacao";
    }

    $c = curl_init();

    curl_setopt($c, CURLOPT_URL, $url);
    curl_setopt($c, CURLOPT_HTTPHEADER, array('X-GLB-Token: '.$_SESSION['glbId']));
    curl_setopt($c, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($c, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($c, CURLOPT_FRESH_CONNECT, TRUE);
    curl_setopt($c, CURLOPT_VERBOSE, TRUE);

    $result = curl_exec($c);

    if ($result === FALSE) {
      die(curl_error($c));
    }

    curl_close($c);

    echo $result;

  }
?>
