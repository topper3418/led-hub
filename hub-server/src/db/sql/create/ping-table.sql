CREATE TABLE IF NOT EXISTS `pings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `device_id` INT NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `success` BOOLEAN NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_device_id_idx` (`device_id` ASC) VISIBLE,
  CONSTRAINT `fk_device_id`
    FOREIGN KEY (`device_id`)
    REFERENCES `led-hub`.`devices` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
