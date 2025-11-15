#include "pico/cyw43_arch.h"
#include "boardLed.h"

void boardLed_init(BoardLed *self) {
    self->on = false;
    cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, self->on);
}

void boardLed_toggle(BoardLed *self) {
    self->on = !self->on;
    cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, self->on);
}

void boardLed_turn_on(BoardLed *self) {
    self->on = true;
    cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 1);
}

void boardLed_turn_off(BoardLed *self) {
    self->on = false;
    cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, 0);
}
