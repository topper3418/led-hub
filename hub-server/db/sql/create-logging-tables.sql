-- Create logger table
CREATE TABLE IF NOT EXISTS `loggers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `level` ENUM("trace", "debug", "info", "warn", "error", "critical") NOT NULL,
    `console` BOOLEAN NOT NULL DEFAULT FALSE,
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE
);

-- Create logs table
CREATE TABLE IF NOT EXISTS `appLogs` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `timestamp` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `logger_id` INT NOT NULL,
  `message` TEXT NULL,
  `data` JSON NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_logger_id_idx` (`logger_id` ASC) VISIBLE,
  CONSTRAINT `fk_logger_id`
    FOREIGN KEY (`logger_id`)
    REFERENCES `loggers` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION);