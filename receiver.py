import time
import struct
import datetime
import pandas as pd
from pyrf24 import *

class SensorData:
    def __init__(self, conductivity=0.0, level=0.0, turbidity=0.0):
        self.conductivity = conductivity
        #self.level = level
        self.turbidity = turbidity

print(__file__)  # print example name

CSN_PIN = 0  # GPIO8 aka CE0 on SPI bus 0: /dev/spidev0.0
#if RF24_DRIVER == "MRAA":
#CE_PIN = 15  # for GPIO22
#elif RF24_DRIVER == "wiringPi":
#CE_PIN = 3  # for GPIO22
#else:
CE_PIN = 22

radio = RF24(CE_PIN, CSN_PIN)

# initialize the nRF24L01 on the spi bus
if not radio.begin():
    raise RuntimeError("radio hardware is not responding")

address = [b"1Node", b"2Node"]

radio_number = bool(
    int(input("Which radio is this? Enter '0' or '1'. Defaults to '0' ") or 0)
)

radio.setPALevel(RF24_PA_LOW)  # RF24_PA_MAX is default

radio.openWritingPipe(address[radio_number])  # always uses pipe 0

radio.openReadingPipe(1, address[not radio_number])  # using pipe 1

radio.payloadSize = struct.calcsize("ff")


def master():
    """Transmits an incrementing float every second"""
    radio.stopListening()  # put radio in TX mode
    failures = 0
    while failures < 6:
        # use struct.pack() to packet your data into the payload
        # "<f" means a single little endian (4 byte) float value.
        buffer = struct.pack("<f", payload[0])
        start_timer = time.monotonic_ns()  # start timer
        result = radio.write(buffer)
        end_timer = time.monotonic_ns()  # end timer
        if not result:
            print("Transmission failed or timed out")
            failures += 1
        else:
            print(
                "Transmission successful! Time to Transmit:",
                f"{(end_timer - start_timer) / 1000} us. Sent: {payload[0]}",
            )
            payload[0] += 0.01
        time.sleep(1)
    print(failures, "failures detected. Leaving TX role.")


def slave(timeout=6):
    """Listen for any payloads and print the transaction

    :param int timeout: The number of seconds to wait (with no transmission)
        until exiting function.
    """
    radio.startListening()  # put radio in RX mode

    start_timer = time.monotonic()
    df = pd.DataFrame(columns=['Time','conductivity', 'level', 'turbidity'])
    c = []
    l = []
    t =[]
    times = []
    i = 0
    while (time.monotonic() - start_timer) < timeout:
        has_payload, pipe_number = radio.available_pipe()
        if has_payload:
            # fetch 1 payload from RX FIFO
            buffer = radio.read(radio.payloadSize)
            # use struct.unpack() to convert the buffer into usable data
            # expecting a little endian float, thus the format string "<f"
            # buffer[:4] truncates padded 0s in case payloadSize was not set
            unpacked_data = struct.unpack("<ff", buffer)
            print(unpacked_data)
            # Create a SensorData instance from unpacked data
            received_sensor_data = SensorData(*unpacked_data)
            conductivity = unpacked_data[0]
            turbidity = unpacked_data[1]
            # print details about the received packet
            print(
                f"Received {radio.payloadSize} bytes on pipe {pipe_number}:",
                f"Conductivity: {conductivity},",
                #f"Level: {received_sensor_data.level},",
                f"Turbidity: {turbidity}"
            )
            i += 1
            c.append(conductivity)
            #l.append(received_sensor_data.level)
            t.append(turbidity)
            
            times.append(str(datetime.datetime.now().hour) + ':' + 
                        str(datetime.datetime.now().minute) + ':' +
                        str(datetime.datetime.now().second))
            

            start_timer = time.monotonic()  # reset the timeout timer
            
            
        if(i == 5):
            df['Time'] = times
            df['conductivity'] = c
            # df['level'] = l
            df['turbidity'] = t
            
            
            times = []
            c = []
            t = []
            print(df)
            with pd.ExcelWriter('/home/pi/water-watch/public/data/water_data.xlsx', mode='a', engine='openpyxl',
            if_sheet_exists='overlay') as writer:
                
                startrow = writer.book['Sheet1'].max_row
                df.to_excel(writer, sheet_name = 'Sheet1', index=False, header=False, startrow=startrow)
            i = 0
            
    print("Nothing received in", timeout, "seconds. Leaving RX role")
    # recommended behavior is to keep in TX mode while idle
    radio.stopListening()  # put the radio in TX mode


def set_role() -> bool:
    """Set the role using stdin stream. Timeout arg for slave() can be
    specified using a space delimiter (e.g. 'R 10' calls `slave(10)`)

    :return:
        - True when role is complete & app should continue running.
        - False when app should exit
    """
    user_input = (
            input(
                "*** Enter 'R' for receiver role.\n"
                "*** Enter 'T' for transmitter role.\n"
                "*** Enter 'Q' to quit example.\n"
            )
            or "?"
    )
    user_input = user_input.split()
    if user_input[0].upper().startswith("R"):
        if len(user_input) > 1:
            slave(int(user_input[1]))
        else:
            slave()
        return True
    if user_input[0].upper().startswith("T"):
        master()
        return True
    if user_input[0].upper().startswith("Q"):
        radio.powerDown()
        return False
    print(user_input[0], "is an unrecognized input. Please try again.")
    return set_role()


if __name__ == "__main__":
    try:
        while set_role():
            pass  # continue example until 'Q' is entered
    except KeyboardInterrupt:
        print(" Keyboard Interrupt detected. Powering down radio.")
        radio.powerDown()
else:
    print("    Run slave() on receiver\n    Run master() on transmitter")
