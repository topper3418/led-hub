#!/bin/bash

echo "Monitoring Python client instances..."

# Count running instances
NUM_RUNNING=$(pgrep -f "python mock-led-client.py" | wc -l)

if [ "$NUM_RUNNING" -eq 0 ]; then
    echo "No client instances are running."
    exit 0
fi

echo "Found $NUM_RUNNING running client instances:"
# List details
ps -C python -o pid,cmd,%cpu,%mem | grep "mock-led-client.py"

echo "Total CPU and memory usage for all instances:"
ps -C python -o %cpu,%mem | grep -v CPU | awk '{cpu+=$1; mem+=$2} END {print "CPU: " cpu "%  Memory: " mem "%"}'

echo "Run './kill-clients.sh' to stop them."
