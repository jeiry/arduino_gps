# arduino_gps
```
#include <SoftwareSerial.h>
// The serial connection to the GPS module
SoftwareSerial air(4, 3);
SoftwareSerial gps(10, 11);
#include <TinyGPS++.h> //到github上下载tinygps这个库
char gpsData;
TinyGPSPlus gpsCls;

void setup() {
  Serial.begin(9600);
  air.begin(9600);
  gps.begin(9600);
  Serial.println("started");
}

void loop() {

  while (Serial.available() > 0) {
    air.write(Serial.read());
    //            byte gpsData = Serial.read();
    //            Serial.println(Serial.read());
  }
  while (gps.available() > 0) {
    //  get the byte data from the GPS
    if (gpsCls.encode(gps.read())) // encode gps data
    {
      displayInfo();
    }
  }


  while (air.available() > 0) {
    byte airData = air.read();
    Serial.write(airData);
    //        Serial.println(airData);
  }
}
String lastString;
void displayInfo()
{
  if (gpsCls.location.isValid())
  {
    //    读取到gps数据 通过4G发给服务器
    Serial.print("Latitude: ");
    Serial.println(gpsCls.location.lat(), 6);
    Serial.print("Longitude: ");
    Serial.println(gpsCls.location.lng(), 6);
    Serial.print("Altitude: ");
    Serial.println(gpsCls.altitude.meters());

    String latitude = String(gpsCls.location.lat(), 6);
    String longitude = String(gpsCls.location.lng(), 6);
    String themeters = String(gpsCls.altitude.meters());

    if (latitude + ";" + longitude + ";" + longitude != lastString) {
      lastString = String(latitude + ";" + longitude + ";" + longitude);
      air.println(latitude + ";" + longitude + ";" + longitude);
    }

  } else
  {
    Serial.println("Location: Not Available");
    lastString = String("searching");
    air.println(lastString);


  }
  delay(1000);
}
```
