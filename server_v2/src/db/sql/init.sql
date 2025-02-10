CREATE TABLE IF NOT EXISTS `room` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE);
);

CREATE TABLE IF NOT EXISTS `devices` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `mac` VARCHAR(17) NOT NULL,
    `name` VARCHAR(45) NULL,
    `ip` VARCHAR(15) NULL,
    `port` VARCHAR(6) NULL,
    `room_id` INT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`room_id`)
    UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
    UNIQUE INDEX `mac_UNIQUE` (`mac` ASC) VISIBLE,
    UNIQUE INDEX `ip_UNIQUE` (`ip` ASC) VISIBLE),
    CONSTRAINT `devices_room_id` 
    FOREIGN KEY (`room_id`) 
    REFERENCES `room` (`id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `led_strip` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `device_id` INT NOT NULL,
    `on` BOOLEAN NULL,
    `brightness` INT NULL,
    `red` INT NULL,
    `green` INT NULL,
    `blue` INT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `device_id_UNIQUE` (`device_id` ASC) VISIBLE,
    CONSTRAINT `led_strip_device_id`
    FOREIGN KEY (`device_id`)
    REFERENCES `devices` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
