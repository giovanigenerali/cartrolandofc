<?php

require __DIR__ . '/config/dsn.php';//variavel $pdo fica disponivel nesse escopo

if (preg_match('/pontuacao\/atleta\/(\d{1,3})/rodada/(\d{1,3})', $_GET["api"], $m)){
    $atletaId = $m[1];
    $rodada = $m[2];
    $json = getRodada($pdo, $rodada);

    if ($json){
        $jsonDecoded = json_decode($json);
        return $jsonDecoded->atletas->{$atletaId};
    }else{
        return '';
    }

}


/**
 * @param PDO $pdo
 * @param $rodada
 * @return string|null
 */
function getRodada(PDO $pdo, $rodada) {
    $statement = $pdo->prepare('select json from rodada = :rodada');
    $statement->bindParam(':rodada', $rodada);
    if ($statement->execute()) {
        return $statement->fetch(PDO::FETCH_ASSOC);
    }else {
        return null;
    }
}