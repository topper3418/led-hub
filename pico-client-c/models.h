#ifndef MODELS_H
#define MODELS_H

#include <stdbool.h>
#include <stdint.h>
#include "hardware/pio.h"

struct cJSON;  // Forward declaration for cJSON.

typedef struct {
    uint8_t r, g, b;
} Color;

typedef struct {
    int id;
    bool on;
    uint8_t brightness;
    int num_leds;
    Color color;
    int led_pin;
    PIO pio;
    uint sm;
} LedStripState;

typedef struct {
    int id;
    int port;
    char ip[16];
    char name[50];
    LedStripState led_strip;
} Device;

// Initializes LedStripState from JSON data, with defaults if keys missing.
void ledStripState_init(LedStripState *self, struct cJSON *led_strip_data);

// Computes the pixel color value for writing (assumes RGB order to match your Python tuple).
uint32_t ledStripState_render(LedStripState *self);

// Initializes Device from JSON data, with defaults if keys missing.
void device_init(Device *self, struct cJSON *device_data);

// Writes the current state to the LED strip (sets all LEDs the same).
void device_write(Device *self);

#endif
