#!/bin/bash

# Define the path to the flash nuke file
NUKE_FILE="./pico-files/flash_nuke.uf2"
FLASH_FILE="./pico-files/RPI_PICO_W-20241129-v1.24.1.uf2"

# Check if we got an argument
if [ "$1" == "--nuke" ]; then
  FILE_TO_UPLOAD=$NUKE_FILE
  ACTION="nuke"
else
  FILE_TO_UPLOAD=$MICROPYTHON_FILE
  ACTION="MicroPython"
fi

# Check if the Pico is in bootloader mode by detecting the mount point
PICO_MOUNT=$(ls /Volumes/ | grep -i "RPI-RP2")

# Check if the Pico is found in bootloader mode
if [ -z "$PICO_MOUNT" ]; then
  echo "Error: Raspberry Pi Pico not found in bootloader mode."
  exit 1
else
  echo "Raspberry Pi Pico detected in bootloader mode."

  # Copy the selected file to the Pico
  echo "Uploading $ACTION file to the Pico..."
  cp "$FILE_TO_UPLOAD" "/Volumes/$PICO_MOUNT"

  # Unmount the Pico after uploading the file (to allow it to reboot)
  echo "Unmounting Pico to allow reboot..."
  umount "/Volumes/$PICO_MOUNT"

  # Wait for a few seconds to allow the Pico to reboot
  sleep 5

  # Check if the Pico is still in bootloader mode (rebooted)
  PICO_REBOOTED=$(ls /Volumes/ | grep -i "RPI-RP2")

  if [ -z "$PICO_REBOOTED" ]; then
    echo "Pico rebooted successfully."
  else
    echo "Error: Pico did not reboot as expected."
    exit 1
  fi
fi
