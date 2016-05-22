<?php
  header('Content-type: application/json');

  require 'auth.php';

  if (isset($_GET["api"]) and $_GET["api"] !== "") {

    if ($_GET["api"] === "liga") {
      $url = "https://api.cartolafc.globo.com/auth/liga/". $_GET["liga_slug"];
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
