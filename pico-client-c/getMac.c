#include "pico/cyw43_arch.h"
#include <stdio.h>
#include "getMac.h"

static char mac_str[18];

char *get_mac_address(void) {
    uint8_t mac[6];
    cyw43_hal_get_mac(CYW43_HAL_MAC_WLAN0, mac);
    sprintf(mac_str, "%02x:%02x:%02x:%02x:%02x:%02x",
            mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    return mac_str;
}
