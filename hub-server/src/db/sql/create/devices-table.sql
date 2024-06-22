CREATE TABLE IF NOT EXISTS `devices` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `mac` VARCHAR(17) NOT NULL,
    `name` VARCHAR(45) NULL,
    `current_ip` VARCHAR(15) NULL,
    `on` BOOLEAN DEFAULT FALSE,
    `brightness` INT NOT NULL DEFAULT 0,
    `red` INT NOT NULL DEFAULT 255,
    `green` INT NOT NULL DEFAULT 255,
    `blue` INT NOT NULL DEFAULT 255,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
    UNIQUE INDEX `mac_UNIQUE` (`mac` ASC) VISIBLE,
    UNIQUE INDEX `current_ip_UNIQUE` (`current_ip` ASC) VISIBLE);
