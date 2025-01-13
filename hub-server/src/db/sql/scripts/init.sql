CREATE TABLE IF NOT EXISTS `devices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mac` VARCHAR(17) NOT NULL,
  `name` VARCHAR(45) NULL,
  `type` ENUM("LedStrip", "Switch", "Blinds") NOT NULL,
  `current_ip` VARCHAR(15) NULL,
  `current_port` VARCHAR(6) NULL,
  `on` BOOLEAN NULL,
  `brightness` INT NULL,
  `red` INT NULL,
  `green` INT NULL,
  `blue` INT NULL,
  `connected` BOOLEAN NOT NULL DEFAULT FALSE,
  `removed` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  UNIQUE INDEX `mac_UNIQUE` (`mac` ASC) VISIBLE,
  UNIQUE INDEX `current_ip_UNIQUE` (`current_ip` ASC) VISIBLE);


CREATE TABLE IF NOT EXISTS `handshakes` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mac` VARCHAR(17) NULL,
  `ip` VARCHAR(15) NULL,
  `port` VARCHAR(6) NULL);
