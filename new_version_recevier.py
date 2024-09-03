from utilities import RF_recevier
TX_adress = [b"1Node", b"2Node"]

if __name__ == "__main__":
    try:
        receiver = RF_recevier(address=TX_adress)
        while True:
            receiver.listen()
    except KeyboardInterrupt:
        print("Keyboard interrupt detected. Exiting...")
        receiver.radio.powerDown()
