#ifndef BOARDLED_H
#define BOARDLED_H

#include <stdbool.h>

typedef struct {
    bool on;
} BoardLed;

// Initializes the onboard LED to off.
void boardLed_init(BoardLed *self);

// Toggles the LED state.
void boardLed_toggle(BoardLed *self);

// Turns the LED on.
void boardLed_turn_on(BoardLed *self);

// Turns the LED off.
void boardLed_turn_off(BoardLed *self);

#endif
