#include "pico/stdlib.h"
#include "pico/cyw43_arch.h"
#include "boardLed.h"
#include "networkConnection.h"
#include "handshake.h"
#include "models.h"
#include "request.h"
#include "config.h"
#include <stdio.h>

// Global for boardLed (to allow parameter-less pending/complete callbacks).
static BoardLed g_boardLed;

// Callbacks for network connection.
static void pending_toggle(void) {
    boardLed_toggle(&g_boardLed);
}

static void complete_turn_on(void) {
    boardLed_turn_on(&g_boardLed);
}

static bool do_handshake(NetworkConnection *connection, Device *device) {
    const char *handshake_endpoint = "devices/";
    while (!handshake(connection, handshake_endpoint, device)) {
        sleep_ms(500);
        boardLed_toggle(&g_boardLed);
    }
    return true;
}

static void get_update(Device *device) {
    boardLed_turn_on(&g_boardLed);
    char update_endpoint[50];
    snprintf(update_endpoint, sizeof(update_endpoint), "devices/%d/led_strip", device->id);

    struct cJSON *response_json = fetch_data(update_endpoint, "GET", NULL);
    if (response_json == NULL) {
        printf("Failed to get update\n");
        return;
    }

    struct cJSON *error = cJSON_GetObjectItem(response_json, "error");
    if (error) {
        printf("error returned: %s\n", error->valuestring);
        cJSON_Delete(response_json);
        return;
    }

    struct cJSON *data = cJSON_GetObjectItem(response_json, "data");
    ledStripState_init(&device->led_strip, data);
    printf("got update from server:\n<LedStrip r:%d, g:%d, b:%d, brightness:%d, [%s]>\n",
           device->led_strip.color.r, device->led_strip.color.g, device->led_strip.color.b,
           device->led_strip.brightness, device->led_strip.on ? "ON" : "OFF");

    device_write(device);
    cJSON_Delete(response_json);
    boardLed_turn_off(&g_boardLed);
}

int main(void) {
    stdio_init_all();
    if (cyw43_arch_init()) {
        printf("Failed to initialize cyw43\n");
        return 1;
    }
    cyw43_arch_enable_sta_mode();

    boardLed_init(&g_boardLed);

    NetworkConnection connection;
    networkConnection_init(&connection, SSID, PASSWORD);
    connection.pending = pending_toggle;
    connection.complete = complete_turn_on;
    networkConnection_connect(&connection);

    Device device;
    do_handshake(&connection, &device);
    boardLed_turn_on(&g_boardLed);

    while (true) {
        get_update(&device);
        sleep_ms(500);
    }
    return 0;
}
