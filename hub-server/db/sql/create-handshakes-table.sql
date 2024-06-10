CREATE TABLE IF NOT EXISTS `led-hub`.`handshakes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mac` VARCHAR(17) NULL,
  `ip` VARCHAR(15) NULL,
  `type` ENUM("init", "restart", "retry") NULL,
  PRIMARY KEY (`id`));