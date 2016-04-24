<?php

  header('Content-type: application/json');

  if (isset($_GET["api"]) and $_GET["api"] !== "") {

    if ($_GET["api"] === "busca-time") {

      echo file_get_contents("https://api.cartolafc.globo.com/times?q=". rawurlencode($_GET["team"]));

    } else if ($_GET["api"] === "busca-atletas") {

      echo file_get_contents("https://api.cartolafc.globo.com/time/". $_GET["team_slug"]);

    }

  }
?>
