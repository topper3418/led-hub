CREATE TABLE IF NOT EXISTS `devices` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `mac` VARCHAR(17) UNIQUE NOT NULL,
    `name` VARCHAR(45) UNIQUE NULL,
    `ip` VARCHAR(15) NULL,
    `last_ping` TIMESTAMP NULL,
    `room_id` INTEGER NULL,
    FOREIGN KEY (`room_id`) 
        REFERENCES `rooms` (`id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

