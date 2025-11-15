#include "models.h"
#include "ws2812.pio.h"  // Generated from pioasm ws2812.pio
#include "hardware/clocks.h"
#include "cJSON.h"
#include <stdlib.h>
#include <stdio.h>

// Helper to write a pixel to the PIO state machine.
static inline void put_pixel(PIO pio, uint sm, uint32_t pixel) {
    pio_sm_put_blocking(pio, sm, pixel << 8u);
}

// Helper to pack RGB into 32-bit value (RGB order to match your Python (r,g,b) tuple send).
static inline uint32_t urgb_u32(uint8_t r, uint8_t g, uint8_t b) {
    return ((uint32_t)r << 16u) | ((uint32_t)g << 8u) | (uint32_t)b;
}

void ledStripState_init(LedStripState *self, struct cJSON *led_strip_data) {
    struct cJSON *item;
    self->id = (item = cJSON_GetObjectItem(led_strip_data, "id")) ? item->valueint : 0;
    self->on = (item = cJSON_GetObjectItem(led_strip_data, "on")) ? (bool)item->valueint : false;
    self->brightness = (item = cJSON_GetObjectItem(led_strip_data, "brightness")) ? (uint8_t)item->valueint : 0;
    self->num_leds = (item = cJSON_GetObjectItem(led_strip_data, "num_leds")) ? item->valueint : 10;
    self->color.r = (item = cJSON_GetObjectItem(led_strip_data, "red")) ? (uint8_t)item->valueint : 0;
    self->color.g = (item = cJSON_GetObjectItem(led_strip_data, "green")) ? (uint8_t)item->valueint : 0;
    self->color.b = (item = cJSON_GetObjectItem(led_strip_data, "blue")) ? (uint8_t)item->valueint : 0;
    self->led_pin = (item = cJSON_GetObjectItem(led_strip_data, "led_pin")) ? item->valueint : 16;

    // Setup PIO for WS2812 (copied from Pico examples, with simple init).
    self->pio = pio0;
    uint offset = pio_add_program(self->pio, &ws2812_program);
    self->sm = pio_claim_unused_sm(self->pio, true);
    ws2812_program_init(self->pio, self->sm, offset, self->led_pin, 800000.0f, false);  // Non-RGBW.
}

uint32_t ledStripState_render(LedStripState *self) {
    if (!self->on) return 0;
    float multiplier = (float)self->brightness / 255.0f;
    uint8_t r = (uint8_t)(self->color.r * multiplier);
    uint8_t g = (uint8_t)(self->color.g * multiplier);
    uint8_t b = (uint8_t)(self->color.b * multiplier);
    return urgb_u32(r, g, b);
}

void device_init(Device *self, struct cJSON *device_data) {
    struct cJSON *item;
    self->id = (item = cJSON_GetObjectItem(device_data, "id")) ? item->valueint : 0;
    self->port = (item = cJSON_GetObjectItem(device_data, "port")) ? item->valueint : 0;
    if ((item = cJSON_GetObjectItem(device_data, "ip"))) strcpy(self->ip, item->valuestring); else self->ip[0] = '\0';
    if ((item = cJSON_GetObjectItem(device_data, "name"))) strcpy(self->name, item->valuestring); else self->name[0] = '\0';
    ledStripState_init(&self->led_strip, cJSON_GetObjectItem(device_data, "led_strip"));
}

void device_write(Device *self) {
    uint32_t color_data = ledStripState_render(&self->led_strip);
    for (int led = 0; led < self->led_strip.num_leds; led++) {
        put_pixel(self->led_strip.pio, self->led_strip.sm, color_data);
    }
}
