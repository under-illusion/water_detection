import time
import struct
import datetime
import pandas as pd
from pyrf24 import *

excel_path = "/home/pi/water-watch/public/data/water_data.xlsx"

class RF_recevier:
    def __init__(self, CSN_PIN=0, CE_PIN=22, address=[b"1Node", b"2Node"]) -> None:
        self.radio = RF24(CE_PIN, CSN_PIN)
        self.address = address

        if not self.radio.begin():
            raise RuntimeError("radio hardware is not responding")
        
        self.radio.setPALevel(RF24_PA_LOW)
        self.radio.openWritingPipe(address[0])  # always uses pipe 0
        self.radio.openReadingPipe(1, address[1])  # using pipe 1
        self.radio.payload_size = struct.calcsize("fff")

    def read_data(self):
        has_payload, pipe_number = self.radio.available_pipe()
        if has_payload:
            buffer = self.radio.read(self.radio.payload_size)

        unpacked_data = struct.unpack("<fff", buffer)
        print(unpacked_data)

        conductivity = unpacked_data[0]
        level = unpacked_data[1]
        turbidity = unpacked_data[2]

        print(
            f"Received {self.radio.payloadSize} bytes on pipe {pipe_number}:",
            f"Conductivity: {conductivity},",
            f"Level: {level},",
            f"Turbidity: {turbidity}"
        )
        return pipe_number, conductivity, level, turbidity
    
    def store_data(self, data):
        for pipe in data.keys():

            df = pd.DataFrame(columns=['Time','Conductivity', 'Level', 'Turbidity'])
            for col, value_list in data.items():
                df[col] = data[pipe][col]

            print(pipe, df)
            with pd.ExcelWriter(path=excel_path, mode='a', engine="openpyxl", 
                                if_sheet_exists="overlay") as writer:
                start_row = writer.book[str(pipe)].max_row

                df.to_excel(writer, sheet_name=str(pipe), 
                            index=False, header=False, startrow=start_row)

    def listen(self, timeout=6):
        self.radio.startListening()

        start_timer = time.monotonic()

        for i in range(1, len(self.address)):
            data = {i:{
                "Time" : [],
                "Conductivity" : [],
                "Level" : [],
                "Turbidity" : []
            }}

        i = 0

        while(time.monotonic() - start_timer) < timeout:
            pipe_number, conductivity, level, turbidity = self.read_data()
            i += 1

            time_now = str(datetime.datetime.now().hour) + ':' + \
                        str(datetime.datetime.now().minute) + ':' + \
                        str(datetime.datetime.now().second)
            
            data[pipe_number]["Time"].append(time_now)
            data[pipe_number]["Conductivity"].append(conductivity)
            data[pipe_number]["Level"].append(level)
            data[pipe_number]["Turbidity"].append(turbidity)

            start_timer = time.monotonic()

            if(i == 5):
                self.store_data(data)
                i = 0
        print("Nothing received in ", timeout, " seconds.")
        # recommended behavior is to keep in TX mode while idle
        self.radio.stopListening()  # put the radio in TX mode
