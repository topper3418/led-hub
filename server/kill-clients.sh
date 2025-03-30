#!/bin/bash

echo "Killing all Python client instances..."

# Count before killing
NUM_RUNNING=$(pgrep -f "python mock-led-client.py" | wc -l)
if [ "$NUM_RUNNING" -eq 0 ]; then
    echo "No client instances found to kill."
    exit 0
fi

echo "Found $NUM_RUNNING instances. Terminating..."
pkill -f "python mock-led-client.py"

# Wait briefly and check again
sleep 1
NUM_LEFT=$(pgrep -f "python mock-led-client.py" | wc -l)

if [ "$NUM_LEFT" -eq 0 ]; then
    echo "All $NUM_RUNNING instances successfully terminated."
else
    echo "Warning: $NUM_LEFT instances still running. Forcing kill..."
    pkill -9 -f "python mock-led-client.py"
    sleep 1
    if [ "$(pgrep -f "python mock-led-client.py" | wc -l)" -eq 0 ]; then
        echo "All instances force-terminated."
    else
        echo "Error: Some instances could not be killed. Check 'ps aux | grep mock-led-client.py'."
    fi
fi
