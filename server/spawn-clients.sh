#!/bin/bash

# Default values
DEFAULT_SERVER="http://localhost:2000/"
DEFAULT_COUNT=10

# Help message
usage() {
    echo "Usage: $0 [-s server_endpoint] [-n num_instances]"
    echo "  -s: Server endpoint (default: $DEFAULT_SERVER)"
    echo "  -n: Number of instances to spawn (default: $DEFAULT_COUNT)"
    exit 1
}

# Parse arguments
while getopts "s:n:h" opt; do
    case $opt in
        s) SERVER_ENDPOINT="$OPTARG";;
        n) NUM_INSTANCES="$OPTARG";;
        h) usage;;
        ?) usage;;
    esac
done

# Set defaults if not provided
SERVER_ENDPOINT=${SERVER_ENDPOINT:-$DEFAULT_SERVER}
NUM_INSTANCES=${NUM_INSTANCES:-$DEFAULT_COUNT}

# Validate num_instances is a positive integer
if ! [[ "$NUM_INSTANCES" =~ ^[0-9]+$ ]] || [ "$NUM_INSTANCES" -le 0 ]; then
    echo "Error: Number of instances must be a positive integer"
    exit 1
fi

echo "Spawning $NUM_INSTANCES client instances to $SERVER_ENDPOINT..."

# Spawn instances
for ((i=1; i<=NUM_INSTANCES; i++)); do
    source venv/bin/activate
    python mock-led-client.py -s "$SERVER_ENDPOINT" &
    echo "Spawned client $i (PID: $!)"
done

echo "All clients spawned. Use './monitor-clients.sh' to check status or './kill-clients.sh' to stop them."
