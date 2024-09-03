import time
import sqlite3
import struct
import datetime
import pandas as pd
from pyrf24 import *

class RF_recevier:
    # initialization
    def __init__(self, CSN_PIN=0, CE_PIN=22, address=[b"1Node", b"2Node"]) -> None:
        self.radio = RF24(CE_PIN, CSN_PIN)
        self.address = address

        if not self.radio.begin():
            raise RuntimeError("radio hardware is not responding")
        
        self.radio.setPALevel(RF24_PA_LOW)
        self.radio.payload_size = struct.calcsize("fff")

    # read the data from pipeline
    def read_data(self):
        has_payload, pipe_number = self.radio.available_pipe()
        # if there is data, then we receive it, or the function will return None

        if has_payload:
            buffer = self.radio.read(self.radio.payload_size)
        else:
            return None

        unpacked_data = struct.unpack("<fff", buffer)

        print(
            f"Received {self.radio.payloadSize} bytes on pipe {pipe_number}:",
            f"The data received:\n {unpacked_data} "
        )

        return unpacked_data
    
    # store the data into sqlite
    def store_data(self, data):
        for pipe in data.keys():

            df = pd.DataFrame(columns=['Time','Conductivity', 'Level', 'Turbidity'])
            for col, _ in data.items():
                df[col] = data[pipe][col]

            print(pipe, df)
            con = sqlite3.connect("WaterDetection.db")
            df.to_sql("Water_data", con=con, if_exists='append', index=False)
            
            # with pd.ExcelWriter(path=excel_path, mode='a', engine="openpyxl",
            #                     if_sheet_exists="overlay") as writer:
            #     start_row = writer.book[str(pipe)].max_row

            #     df.to_excel(writer, sheet_name=str(pipe), 
            #                 index=False, header=False, startrow=start_row)
      
    def receive_data(self, pipe_n, addr, timeout):
        self.radio.openReadingPipe(pipe_n, addr)
        self.radio.startListening()
        start_timer = time.monotonic()

        while(time.monotonic() - start_timer) < timeout:
            unpacked_data = self.read_data()
            if(unpacked_data == None):
                continue
            
            time_now = str(datetime.datetime.now().hour) + ':' + \
            str(datetime.datetime.now().minute) + ':' + \
            str(datetime.datetime.now().second)
            
            return time_now, unpacked_data
        print(f"Nothing received in {timeout} seconds on pipeline {pipe_n}.")
        return None, None


    def listen(self, timeout=1):
        for pipe_n, addr in enumerate(self.address):
            
            time_now, unpacked_data = self.receive_data(pipe_n, addr, timeout)
            if time_now == None:
                continue
            
            data = {"pipe_n":[], "Time":[], "Conductivity":[], "Level":[], "Turbidity":[]}
            data["Pipe_n"].append(pipe_n)
            data["Time"].append(time_now)
            data["Conductivity"].append(unpacked_data[0])
            data["Level"].append(unpacked_data[1])
            data["Turbidity"].append(unpacked_data[2])

            self.store_data(data)
        self.radio.stopListening()
