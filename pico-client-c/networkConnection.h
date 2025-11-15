#ifndef NETWORKCONNECTION_H
#define NETWORKCONNECTION_H

typedef struct {
    char ssid[32];
    char password[64];
    char ip[16];
    void (*pending)(void);
    void (*complete)(void);
} NetworkConnection;

// Initializes the network connection struct.
void networkConnection_init(NetworkConnection *self, const char *ssid, const char *password);

// Connects to WiFi, calling pending() in loop if set, complete() on success if set.
void networkConnection_connect(NetworkConnection *self);

#endif
