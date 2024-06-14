CREATE TABLE IF NOT EXISTS `devices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mac` VARCHAR(17) NOT NULL,
  `name` VARCHAR(45) NULL,
  `type` ENUM("LedStrip", "Switch", "Blinds") NOT NULL,
  `current_ip` VARCHAR(15) NULL,
  `removed` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  UNIQUE INDEX `mac_UNIQUE` (`mac` ASC) VISIBLE,
  UNIQUE INDEX `current_ip_UNIQUE` (`current_ip` ASC) VISIBLE);


CREATE TABLE IF NOT EXISTS `handshakes` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mac` VARCHAR(17) NULL,
  `ip` VARCHAR(15) NULL);


-- Create logger table
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `timestamp` datetime NOT NULL,
  `logger` varchar(45) NOT NULL,
  `level` varchar(10) NOT NULL,
  `message` varchar(2550) NOT NULL,
  `meta` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
