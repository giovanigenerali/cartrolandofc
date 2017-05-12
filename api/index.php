<?php

require __DIR__ . '/../config/dsn.php';
$uri = $_SERVER['REQUEST_URI'];

//atleta e rodada
if(preg_match('#^(\/index\.php)?/pontuacao\/atleta\/(\d{4,6})/rodada/(\d{1,2})$#i', $uri, $m)){
    $atletaId = $m[2];
    $rodada = $m[3];
    $result = getByAtletaAndRodada($pdo, $atletaId, $rodada);
    $parsed = parser($result);
    if (count($parsed) > 0) {
        echo json_encode(($parsed + ['status' => 'ok']));
    }else {
        echo json_encode(['status' => 'atleta_id ou rodada nao encontrada']);
    }
}


//atleta
if(preg_match('#^(\/index\.php)?/pontuacao\/atleta\/(\d{4,6})$#i', $uri, $m)){
    $atletaId = $m[2];
    $pontuacao = getByAtleta($pdo, $atletaId);
    $parsed = parser($pontuacao);
    if (count($parsed) > 0) {
        echo json_encode(($parsed + ['status' => 'ok']));
    }else {
        echo json_encode(['status' => 'atleta_id ou rodada nao encontrada']);
    }
}


function parser($pontuados) {
    if (count($pontuados) === 0) {
        return null;
    }
    $retorno = [];
    $retorno['atleta_id'] = $pontuados[0]['atleta_id'];
    $retorno['apelido'] = $pontuados[0]['apelido'];
    $retorno['foto'] = $pontuados[0]['foto'];
    $retorno['posicao_id'] = $pontuados[0]['posicao_id'];
    $retorno['clube_id'] = $pontuados[0]['clube_id'];
    foreach ($pontuados as $k => $p) {
        $retorno['rodadas'][$p['rodada']] = ['pontuacao' => $p['pontuacao']];
    }
    return $retorno;
}


/**
 * @param PDO $pdo
 * @param $rodada
 * @return string|null
 */
function getByAtleta(PDO $pdo, $atleta) {
    $statement = $pdo->prepare('select rodada, atleta_id, apelido, pontuacao, foto, posicao_id, clube_id from rodada_pontuacao where atleta_id = :atleta');
    $statement->bindParam(':atleta', $atleta);
    if ($statement->execute()) {
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }else {
        return null;
    }
}

/**
 * @param PDO $pdo
 * @param $rodada
 * @return string|null
 */
function getByAtletaAndRodada(PDO $pdo, $atleta, $rodada) {
    $statement = $pdo->prepare('select rodada, atleta_id, apelido, pontuacao, foto, posicao_id, clube_id from rodada_pontuacao where atleta_id = :atleta AND rodada = :rodada');
    $statement->bindParam(':atleta', $atleta);
    $statement->bindParam(':rodada', $rodada);
    if ($statement->execute()) {
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }else {
        return null;
    }
}