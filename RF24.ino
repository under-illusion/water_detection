#include <SPI.h>
#include "RF24.h"

#define CE_PIN 9
#define CSN_PIN 10

struct SensorData {
  float conductivity;
  float level;
  float turbidity;
};

SensorData readSensors() {
  SensorData data;
  
  // 读取电导率传感器的值（模拟输入）
  float compensationVolatge = analogRead(A0) * (5.0 / 1024.0);
  data.conductivity = ((133.42 * compensationVolatge * compensationVolatge * compensationVolatge - 
                        255.86 * compensationVolatge * compensationVolatge + 
                        857.39*compensationVolatge) * 0.5 * 1.8);
  
  // 读取水位传感器的值（数字输入）
  data.level = digitalRead(A1);
  
  // 读取浊度传感器的值
  float sensorValue = analogRead(A2);
  data.turbidity = sensorValue * (5.0 / 1024.0);
  
  return data;
}

RF24 radio(CE_PIN, CSN_PIN);

uint8_t address[][3] = {"1Node"};

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    // some boards need to wait to ensure access to serial over USB
  }

  // initialize the transceiver on the SPI bus
  if (!radio.begin()) {
    Serial.println(F("radio hardware is not responding!!"));
    while (1) {}  // hold in infinite loop
  }
  
  Serial.println(F("Prepared to send data."));
  radio.setPALevel(RF24_PA_LOW);

  radio.setPayloadSize(sizeof(SensorData));

  radio.openWritingPipe(address[0]);

  radio.stopListening();  // put radio in TX mode
}

void loop() {

    Serial.print(F("Ready to transmit data..."));

    SensorData sensorData = readSensors();
    unsigned long start_timer = micros();                // start the timer
    bool report = radio.write(&sensorData, sizeof(SensorData));  // transmit & save the report
    unsigned long end_timer = micros();                  // end the timer

    if (report) {
      Serial.print(F("Transmission successful! "));  // payload was delivered
      Serial.print(F("Time to transmit = "));
      Serial.print(end_timer - start_timer);  // print the timer result
      Serial.print(F(" us. Sent: "));
      
      Serial.print(" conductivity: ");
      Serial.println(sensorData.conductivity);
      Serial.print(" level: ");
      Serial.println(sensorData.level);
      Serial.print(" turbidity: ");
      Serial.println(sensorData.turbidity);
    } else {
      Serial.println(F("Transmission failed or timed out"));  // payload was not delivered
    }
    // to make this example readable in the serial monitor
    delay(1000);  // slow transmissions down by 1 second
}
