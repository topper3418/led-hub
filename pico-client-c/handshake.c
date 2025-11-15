#include "handshake.h"
#include "getMac.h"
#include "models.h"
#include "request.h"
#include "networkConnection.h"
#include "cJSON.h"
#include <stdio.h>
#include <stdlib.h>

bool handshake(struct NetworkConnection *connection, const char *relative_endpoint, struct Device *device) {
    char *mac = get_mac_address();
    printf("got mac: %s\n", mac);

    cJSON *handshake_data = cJSON_CreateObject();
    cJSON_AddStringToObject(handshake_data, "mac", mac);
    cJSON_AddStringToObject(handshake_data, "type", "LedStrip");
    cJSON_AddStringToObject(handshake_data, "ip", connection->ip);

    cJSON *post_data = cJSON_CreateObject();
    cJSON_AddItemToObject(post_data, "data", handshake_data);

    char *body = cJSON_PrintUnformatted(post_data);
    cJSON_Delete(post_data);

    printf("attempting handshake with at \"%s\"\n", relative_endpoint);
    cJSON *res_json = fetch_data(relative_endpoint, "POST", body);
    free(body);

    if (res_json == NULL) {
        printf("handshake failed\n");
        return false;
    }

    cJSON *error = cJSON_GetObjectItem(res_json, "error");
    if (error) {
        printf("received error: %s\n", error->valuestring);
        cJSON_Delete(res_json);
        return false;
    }

    cJSON *data = cJSON_GetObjectItem(res_json, "data");
    device_init(device, data);
    printf("received response:\n%s\n", cJSON_Print(res_json));
    device_write(device);
    cJSON_Delete(res_json);
    return true;
}
