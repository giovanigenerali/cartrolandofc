<?php
  header('Content-type: application/json');

  if (isset($_GET["api"]) and $_GET["api"] !== "") {

    if ($_GET["api"] === "busca-time") {
      $url = "https://api.cartolafc.globo.com/times?q=". rawurlencode($_GET["team"]);
    } else if ($_GET["api"] === "busca-atletas") {
      $url = "https://api.cartolafc.globo.com/time/". $_GET["team_slug"];
    } else if ($_GET["api"] === "parciais-atletas") {
      $url = "https://api.cartolafc.globo.com/atletas/pontuados";
    }

    $c = curl_init();
    curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($c, CURLOPT_URL, $url);
    $result = curl_exec($c);
    curl_close($c);
    echo $result;
  }
?>
