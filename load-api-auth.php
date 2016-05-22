<?php
  session_start();

  header('Content-type: application/json');

  if (isset($_GET["api"]) and $_GET["api"] !== "") {

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

    $c = curl_init();
    curl_setopt($c, CURLOPT_URL, $url);
    curl_setopt($c, CURLOPT_HTTPHEADER, array('X-GLB-Token: '.$_SESSION['glbId']));
    curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($c, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($c, CURLOPT_VERBOSE, true);
    $result = curl_exec($c);
    if ($result === FALSE) {
      die(curl_error($c));
    }
    curl_close($c);
    echo $result;
  }
?>
