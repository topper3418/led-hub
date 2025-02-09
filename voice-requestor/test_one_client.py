from src.integratedClient import IntegratedClient
import time


# initialize client
client = IntegratedClient()

# read all devices
devices = client.read_all()
connected_devices = {device.data.name: device for device in devices if device.state.connected}

# pull out the test LED
target_device = connected_devices['Test LED']
print(target_device)

# turn it on
target_device.state.on = True
# set it to full brightness, white
target_device.state.brightness = 100
target_device.state.color.red = 255
target_device.state.color.green = 255
target_device.state.color.blue = 255
response = target_device.update()
# response = client.write_one(target_device)
print(response)
time.sleep(1)

# make it dim teal
target_device.state.brightness = 25
target_device.state.color.red = 0
target_device.state.color.green = 128
target_device.state.color.blue = 128
response = target_device.update()
# response = client.write_one(target_device)
print(response)
time.sleep(1)

# make it super dim red
target_device.state.brightness = 1
target_device.state.color.red = 255
target_device.state.color.green = 0
target_device.state.color.blue = 0
response = target_device.update()
# response = client.write_one(target_device)
print(response)
time.sleep(1)

# turn it off
target_device.state.on = False
response = target_device.update()
# response = client.write_one(target_device)
print(response)
