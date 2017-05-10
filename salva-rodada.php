<?php
//so pode ser executado via CLI
if (!(php_sapi_name() === 'cli')) {
    exit(0);
}

$config = require __DIR__ . '/config/dsn.php';

//requisita a api da rodada
$url = "https://api.cartolafc.globo.com/atletas/pontuados";
$json = file_get_contents($url);
$jsonDecoded = json_decode($json);

if (isset($jsonDecoded->rodada) && $jsonDecoded->rodada) {
    if (!existsRodada($pdo, $jsonDecoded->rodada)){
        $statement = $pdo->prepare('insert into rodada_pontuacao (rodada, json) VALUES (:rodada, :json);');
        $statement->bindParam(':rodada', $jsonDecoded->rodada);
        $statement->bindParam(':json', $json);
        if ($statement->execute()) {
            printf("rodada %s salva na tabela\n", $jsonDecoded->rodada);
        }else {
            printf("não foi possivel salvar a rodada, erro: %s %s\n", $jsonDecoded->rodada, $statement->errorCode(), $statement->errorInfo());
        }
    }else {
        printf("rodada %s existe na tabela\n", $jsonDecoded->rodada);
    }

}else{
    printf("sem resposta da api\n");
}

/**
 * verifica se existe a rodada na tabela
 * @param PDO $pdo
 * @param $rodada
 * @return bool
 */
function existsRodada(PDO $pdo, $rodada) {
    $statement = $pdo->prepare("SELECT id from rodada_pontuacao where rodada = :id");
    $statement->bindParam(":id", $rodada);
    $statement->execute();

    $result = $statement->fetchAll(PDO::FETCH_ASSOC);
    return  count($result) > 0 ? true : false;
}
