<?php

  $post = file_get_contents('php://input');
  $data = json_decode($post);
  $classifier = $data->p_classifier;
  $feature = $data->p_featureVector;
  
  try {
    define('DB','mysql:host=localhost;dbname=HoG');
    define('USER','HoGUser');
    define('PASS','hog4fun');
    $con = new PDO( DB,USER,PASS,array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION) );
  } catch(Exception $e) {
      die(0);
  }

  $stmt = $con->prepare("CALL add_a_feature_and_class(:classifier, :feature);");
  $stmt->bindValue(':classifier',strval($classifier),PDO::PARAM_STR);
  $stmt->bindValue(':feature',strval($feature),PDO::PARAM_STR);
  $stmt->execute();

?>