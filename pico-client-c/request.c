#include "request.h"
#include "config.h"
#include "cJSON.h"
#include "lwip/netconn.h"
#include "lwip/dns.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

static struct cJSON *fetch_data_recursive(const char *relative_url, const char *method, const char *body, int redirect_count, int max_redirects) {
    if (redirect_count >= max_redirects) {
        printf("Too many redirects\n");
        return NULL;
    }

    struct netconn *conn = netconn_new(NETCONN_TCP);
    if (conn == NULL) {
        printf("Failed to create connection\n");
        return NULL;
    }

    ip_addr_t ip;
    err_t err = netconn_gethostbyname(SERVER_ADDRESS, &ip);
    if (err != ERR_OK) {
        printf("DNS failed: %d\n", err);
        netconn_delete(conn);
        return NULL;
    }

    err = netconn_connect(conn, &ip, SERVER_PORT);
    if (err != ERR_OK) {
        printf("Connect failed: %d\n", err);
        netconn_delete(conn);
        return NULL;
    }

    char path[256];
    snprintf(path, sizeof(path), "/%s", relative_url);

    char headers[256];
    size_t body_len = body ? strlen(body) : 0;
    snprintf(headers, sizeof(headers), "Host: %s\r\nConnection: close\r\n", SERVER_ADDRESS);
    if (strcmp(method, "POST") == 0 && body) {
        char len_str[50];
        snprintf(len_str, sizeof(len_str), "Content-Type: application/json\r\nContent-Length: %zu\r\n", body_len);
        strcat(headers, len_str);
    }

    char request[512];
    snprintf(request, sizeof(request), "%s %s HTTP/1.1\r\n%s\r\n", method, path, headers);

    err = netconn_write(conn, request, strlen(request), NETCONN_COPY);
    if (err != ERR_OK) {
        printf("Write request failed\n");
        netconn_close(conn);
        netconn_delete(conn);
        return NULL;
    }

    if (body) {
        err = netconn_write(conn, body, body_len, NETCONN_COPY);
        if (err != ERR_OK) {
            printf("Write body failed\n");
            netconn_close(conn);
            netconn_delete(conn);
            return NULL;
        }
    }

    // Receive response.
    char *response = NULL;
    size_t total_len = 0;
    struct netbuf *buf;
    while ((err = netconn_recv(conn, &buf)) == ERR_OK) {
        void *data;
        u16_t len;
        netbuf_data(buf, &data, &len);
        response = realloc(response, total_len + len + 1);
        memcpy(response + total_len, data, len);
        total_len += len;
        response[total_len] = '\0';
        netbuf_delete(buf);
    }
    netconn_close(conn);
    netconn_delete(conn);
    if (err != ERR_CLSD && err != ERR_OK) {
        printf("Recv error: %d\n", err);
        free(response);
        return NULL;
    }

    // Parse response.
    char *header_end = strstr(response, "\r\n\r\n");
    if (header_end == NULL) {
        printf("Invalid response: no header end\n");
        free(response);
        return NULL;
    }
    *header_end = '\0';
    char *body_start = header_end + 4;

    char *headers_copy = response;  // For strtok.
    char *status_line = strtok(headers_copy, "\r\n");
    int status_code = atoi(status_line + 9);  // Skip "HTTP/1.1 ".

    printf("Status code: %d\n", status_code);
    printf("Received data: %s\n", body_start);

    if (status_code != 200) {
        if (status_code >= 300 && status_code < 310) {
            // Handle redirect.
            char *line = strtok(NULL, "\r\n");
            while (line) {
                if (strncasecmp(line, "Location:", 9) == 0) {
                    char *new_url = line + 9;
                    while (*new_url == ' ') new_url++;
                    printf("Redirecting to: %s\n", new_url);
                    char new_relative[256];
                    if (strncasecmp(new_url, "http://", 7) == 0) {
                        new_url += 7;
                        char *path_start = strchr(new_url, '/');
                        if (path_start) {
                            strcpy(new_relative, path_start + 1);
                        } else {
                            new_relative[0] = '\0';
                        }
                    } else {
                        strcpy(new_relative, new_url);
                        if (new_relative[0] == '/') memmove(new_relative, new_relative + 1, strlen(new_relative));
                    }
                    const char *new_method = (status_code == 301 || status_code == 302 || status_code == 303) ? "GET" : method;
                    free(response);
                    return fetch_data_recursive(new_relative, new_method, strcmp(new_method, "GET") == 0 ? NULL : body, redirect_count + 1, max_redirects);
                }
                line = strtok(NULL, "\r\n");
            }
            printf("Redirect without Location\n");
        }
        free(response);
        return NULL;
    }

    struct cJSON *json = cJSON_Parse(body_start);
    free(response);
    if (json == NULL) {
        printf("JSON parse failed\n");
        return NULL;
    }
    return json;
}

struct cJSON *fetch_data(const char *relative_url, const char *method, const char *body) {
    return fetch_data_recursive(relative_url, method, body, 0, 5);
}
