#CREATE DATABASE AND TABLES
#DROP DATABASE HoG;
#CREATE DATABASE HoG;

USE HoG;

CREATE TABLE feature_and_class(
	id INT AUTO_INCREMENT,
	classifier VARCHAR(128),
	feature LONGTEXT,	
	dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (ID)
);

DELIMITER //
CREATE PROCEDURE add_a_feature_and_class( 
	IN classifier varchar(128), 
	IN feature LONGTEXT
)
BEGIN
	INSERT INTO feature_and_class VALUES( id, classifier, feature, NOW() ); 
END // 
DELIMITER ;

CREATE USER "HoGUser" IDENTIFIED BY "hog4fun";
REVOKE ALL ON *.* FROM "HoGUser";
GRANT INSERT, SELECT ON HoG.feature_and_class TO "HoGUser";
GRANT EXECUTE ON PROCEDURE HoG.add_a_feature_and_class TO "HoGUser";
FLUSH privileges;