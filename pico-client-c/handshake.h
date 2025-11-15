#ifndef HANDSHAKE_H
#define HANDSHAKE_H

struct NetworkConnection;  // Forward.
struct Device;  // Forward.

// Performs handshake with server, initializes device on success.
bool handshake(struct NetworkConnection *connection, const char *relative_endpoint, struct Device *device);

#endif
