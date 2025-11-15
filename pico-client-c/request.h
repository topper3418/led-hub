#ifndef REQUEST_H
#define REQUEST_H

struct cJSON *fetch_data(const char *relative_url, const char *method, const char *body);

#endif
