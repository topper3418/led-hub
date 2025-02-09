from src.integratedClient import IntegratedClient
import time


# initialize client
client = IntegratedClient()

# read all devices
devices = client.read_all()
connected_devices = {device.name: device for device in devices if device.connected}

# pull out the test LED
target_device = connected_devices['Test LED']
print(target_device)

# turn it on
target_device.on = True
# set it to full brightness, white
target_device.brightness = 100
target_device.color.r = 255
target_device.color.g = 255
target_device.color.b = 255
response = client.write_one(target_device)
print(response)
time.sleep(1)

# make it dim teal
target_device.brightness = 25
target_device.color.r = 0
target_device.color.g = 128
target_device.color.b = 128
response = client.write_one(target_device)
print(response)
time.sleep(1)

# make it super dim red
target_device.brightness = 1
target_device.color.r = 255
target_device.color.g = 0
target_device.color.b = 0
response = client.write_one(target_device)
print(response)
time.sleep(1)

# turn it off
target_device.on = False
response = client.write_one(target_device)
print(response)
