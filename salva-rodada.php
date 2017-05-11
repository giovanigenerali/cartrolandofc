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
        foreach ($jsonDecoded->atletas as $atletaId => $atleta) {
            $statement = $pdo->prepare('insert into rodada_pontuacao (rodada, atleta_id, apelido, pontuacao, foto, posicao_id, clube_id) 
                                    VALUES (:rodada, :atleta, :apelido, :pontuacao, :foto, :posicao, :clube);');
            $statement->bindParam(':rodada', $jsonDecoded->rodada);
            $statement->bindParam(':atleta', $atletaId);
            $statement->bindParam(':apelido', $atleta->apelido);
            $statement->bindParam(':pontuacao', $atleta->pontuacao);
            $statement->bindParam(':foto', $atleta->foto);
            $statement->bindParam(':posicao', $atleta->posicao_id);
            $statement->bindParam(':clube', $atleta->clube_id);
            if ($statement->execute()) {
                printf("atleta %s salvo na tabela\n", $atletaId);
            }else {
                printf("não foi possivel salvar o atleta, erro: %s %s\n", $atletaId, $statement->errorCode(), $statement->errorInfo());
            }
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
