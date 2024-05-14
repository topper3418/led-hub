
# board LED api
class BoardLed:
    
    def __init__(self):
        self.pin = Pin('LED', Pin.OUT)
        self.on = False
        self.pin.value(self.on)
    
    def toggle(self):
        newStatus = not self.on
        self.pin.value(newStatus)
        self.on = newStatus
    
    def turnOn(self):
        self.on = True
        self.pin.value(1)
    
    def turnOff(self):
        self.on = False
        self.pin.value(0)