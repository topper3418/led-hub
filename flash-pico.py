import os
import shutil
import time
import sys
import argparse

def detect_pico():
    """Detect if Raspberry Pi Pico is in bootloader mode by looking for the 'RPI-RP2' mount point."""
    volumes = os.listdir("/Volumes/")
    pico_mount = [vol for vol in volumes if "RPI-RP2" in vol]
    return pico_mount[0] if pico_mount else None

def upload_file(file_path, pico_mount):
    """Upload a single file to the Pico."""
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist.")
        sys.exit(1)

    print(f"Uploading {file_path} to the Pico...")

    try:
        shutil.copy(file_path, f"/Volumes/{pico_mount}")
        print(f"Successfully uploaded {file_path} to the Pico.")
    except Exception as e:
        print(f"Error during upload: {e}")
        sys.exit(1)

def upload_project_to_pico(project_dir, pico_mount):
    """Upload the project directory to the Pico."""
    if not os.path.exists(project_dir):
        print(f"Error: Project directory {project_dir} does not exist.")
        sys.exit(1)

    print(f"Uploading the project from {project_dir} to the Pico...")

    # Copy the entire project directory to the Pico's mounted drive
    try:
        shutil.copytree(project_dir, f"/Volumes/{pico_mount}/led-server")
        print(f"Successfully uploaded {project_dir} to the Pico.")
    except Exception as e:
        print(f"Error during upload: {e}")
        sys.exit(1)

def unmount_pico(pico_mount):
    """Unmount the Pico to allow reboot or code execution."""
    print("Unmounting Pico to allow reboot...")
    try:
        os.system(f"umount /Volumes/{pico_mount}")
    except Exception as e:
        print(f"Error during unmounting: {e}")
        sys.exit(1)

def main():
    # Set up argument parsing
    parser = argparse.ArgumentParser(description="Upload files or projects to Raspberry Pi Pico.")
    parser.add_argument('--nuke', action='store_true', help="Upload the nuke file to the Pico.")
    parser.add_argument('--micropython', action='store_true', help="Upload the MicroPython file to the Pico.")
    parser.add_argument('--project', action='store_true', help="Upload the project directory to the Pico.")
    args = parser.parse_args()

    # Define file paths
    nuke_file = "./pico-files/flash_nuke.uf2"
    micropython_file = "./pico-files/RPI_PICO_W-20241129-v1.24.1.uf2"
    project_dir = "./led-server"

    # Detect Pico in bootloader mode
    pico_mount = detect_pico()

    if not pico_mount:
        print("Error: Raspberry Pi Pico not found in bootloader mode.")
        sys.exit(1)
    else:
        print(f"Raspberry Pi Pico detected in bootloader mode: {pico_mount}")

    # Handle the flags
    if args.nuke:
        print("Uploading nuke file...")
        upload_file(nuke_file, pico_mount)
    elif args.micropython:
        print("Uploading MicroPython file...")
        upload_file(micropython_file, pico_mount)
    elif args.project:
        print("Uploading project directory...")
        upload_project_to_pico(project_dir, pico_mount)
    else:
        print("Error: No valid flag provided. Use --nuke, --micropython, or --project.")
        sys.exit(1)

    # Unmount the Pico to allow it to reboot or run the code
    unmount_pico(pico_mount)

    # Wait for a few seconds to allow the Pico to reboot
    print("Waiting for Pico to reboot...")
    time.sleep(5)

    # Check if the Pico has rebooted (no longer in bootloader mode)
    pico_rebooted = detect_pico()

    if not pico_rebooted:
        print("Pico rebooted successfully.")
    else:
        print("Error: Pico did not reboot as expected.")
        sys.exit(1)

if __name__ == "__main__":
    main()
