cmake_minimum_required(VERSION 3.13)
include($ENV{PICO_SDK_PATH}/external/pico_sdk_import.cmake)

project(led-client C CXX ASM)
pico_sdk_init()

add_executable(led-client
    main.c
    boardLed.c
    getMac.c
    models.c
    networkConnection.c
    handshake.c
    request.c
    cJSON/cJSON.c
)

pico_generate_pio_header(led-client ${CMAKE_CURRENT_LIST_DIR}/ws2812.pio)

target_link_libraries(led-client
    pico_stdlib
    hardware_pio
    pico_cyw43_arch_lwip_threadsafe_background
)

pico_enable_stdio_usb(led-client 1)
pico_enable_stdio_uart(led-client 0)

pico_add_extra_outputs(led-client)
