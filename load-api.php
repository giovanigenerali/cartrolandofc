<?php

  header('Content-type: application/json');

  if (isset($_GET["api"]) and $_GET["api"] !== "") {

    if ($_GET["api"] === "busca-time") {

      echo file_get_contents("http://api.cartola.globo.com/time/busca.json?nome=". rawurlencode($_GET["team"]));

    } else if ($_GET["api"] === "busca-atletas") {

      echo file_get_contents("http://api.cartola.globo.com/time_adv/". $_GET["team_slug"] .".json");

    }

  }
?>