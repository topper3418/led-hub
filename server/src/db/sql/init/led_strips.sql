CREATE TABLE IF NOT EXISTS `led_strips` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `device_id` INT UNIQUE NOT NULL,
    `on` BOOLEAN NULL,
    `brightness` INT NULL,
    `red` INTEGER NULL,
    `green` INTEGER NULL,
    `blue` INTEGER NULL,
    `num_leds` INT NULL,
    FOREIGN KEY (`device_id`)
        REFERENCES `devices` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

