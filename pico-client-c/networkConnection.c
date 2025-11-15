#include "networkConnection.h"
#include "pico/cyw43_arch.h"
#include "lwip/ip4_addr.h"
#include <string.h>
#include <stdio.h>
#include "pico/stdlib.h"

void networkConnection_init(NetworkConnection *self, const char *ssid, const char *password) {
    strcpy(self->ssid, ssid);
    strcpy(self->password, password);
    self->ip[0] = '\0';
    self->pending = NULL;
    self->complete = NULL;
}

void networkConnection_connect(NetworkConnection *self) {
    int err = cyw43_arch_wifi_connect_async(self->ssid, self->password, CYW43_AUTH_WPA2_AES_PSK);
    if (err) {
        printf("Failed to start connection: %d\n", err);
        return;
    }
    int status = CYW43_LINK_DOWN;
    while (status < CYW43_LINK_JOIN) {
        status = cyw43_wifi_link_status(&cyw43_state, CYW43_ITF_STA);
        if (status < 0) {
            printf("Connection error: %d\n", status);
            return;
        }
        printf("Waiting for connection...\n");
        if (self->pending) self->pending();
        sleep_ms(500);
    }
    ip_addr_t ip = cyw43_state.netif[CYW43_ITF_STA].ip_addr;
    strcpy(self->ip, ip4addr_ntoa(&ip));
    printf("Connected on %s\n", self->ip);
    if (self->complete) self->complete();
}
