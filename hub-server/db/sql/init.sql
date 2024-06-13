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
CREATE TABLE IF NOT EXISTS `loggers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `level` ENUM("trace", "debug", "info", "warn", "error", "critical") NOT NULL,
    `printtoconsole` BOOLEAN NOT NULL DEFAULT FALSE,
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE);

-- Create logs table
CREATE TABLE IF NOT EXISTS `appLogs` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `timestamp` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `logger_id` INT NOT NULL,
  `level` ENUM("trace", "debug", "info", "warn", "error", "critical") NOT NULL,
  `message` TEXT NULL,
  `data` JSON NULL,
  INDEX `fk_logger_id_idx` (`logger_id` ASC) VISIBLE,
  CONSTRAINT `fk_logger_id`
    FOREIGN KEY (`logger_id`)
    REFERENCES `loggers` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);