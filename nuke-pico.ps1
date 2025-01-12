# TODO:
# completely re-do this, I'm giving up and switching to mac for this purpose. 
# Define the target file to upload
$fileToUpload = "C:/Users/travi/code/led-hub/pico-files/flash_nuke.uf2"  # Adjust the path accordingly

# Define the Raspberry Pi Pico's drive letter (G: in this case)
$picoDriveLetter = "G:"

# Check if the Raspberry Pi Pico is connected as a USB Mass Storage Device
$device = Get-WmiObject Win32_PnPEntity | Where-Object { $_.DeviceID -like "*VID_2E8A*" }

if ($device) {
    Write-Host "Raspberry Pi Pico detected!"

    # Check if the G: drive (Pico's storage) is available
    if (Test-Path $picoDriveLetter) {
        Write-Host "Raspberry Pi Pico is available at $picoDriveLetter"

        # Copy the flash_nuke.uf2 file to the Raspberry Pi Pico
        $destination = Join-Path $picoDriveLetter "flash_nuke.uf2"

        try {
            Copy-Item -Path $fileToUpload -Destination $destination -Force
            Write-Host "File uploaded successfully to Raspberry Pi Pico."
        } catch {
            Write-Host "Failed to upload file: $_"
        }
    } else {
        Write-Host "Raspberry Pi Pico is not mounted as a drive. Please check the connection."
    }
} else {
    Write-Host "Raspberry Pi Pico not detected. Please ensure the device is in bootloader mode and connected."
}
