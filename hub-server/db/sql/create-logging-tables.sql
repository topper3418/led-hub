-- Create logger table
CREATE TABLE if not exists `loggers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `level` ENUM("trace", "debug", "info", "warn", "error", "critical") NOT NULL,
    `console` BOOLEAN NOT NULL DEFAULT FALSE,
    `enabled` BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE
);

-- Create logs table
CREATE TABLE `logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `logger_id` INT,
    `message` TEXT,
    `data` JSON,
    `FOREIGN` KEY (logger_id) REFERENCES logger(id)
);
