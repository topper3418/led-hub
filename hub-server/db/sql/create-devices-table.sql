CREATE TABLE `led-hub`.`devices` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mac` VARCHAR(17) NOT NULL,
  `name` VARCHAR(45) NULL,
  `current_ip` VARCHAR(15) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  UNIQUE INDEX `mac_UNIQUE` (`mac` ASC) VISIBLE,
  UNIQUE INDEX `current_ip_UNIQUE` (`current_ip` ASC) VISIBLE);