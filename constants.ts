export const ESP32_FIRMWARE_CODE = `
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <ESP32Servo.h>

// 1. Credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

#define API_KEY "AIzaSyAE52-trnyGUnQvW6Z1z55DG88j466Ogyo"
#define DATABASE_URL "https://nfc-parking-v3-default-rtdb.firebaseio.com/"

// 2. Objects
FirebaseData fbDO;
FirebaseAuth auth;
FirebaseConfig config;
Servo gateServo;

// 3. Pin Definitions
#define SERVO_PIN 27

// 4. Variables
unsigned long lastTime = 0;
bool isGateOpen = false;

void setup() {
  Serial.begin(115200);

  // WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  // Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.signer.test_mode = true; // Use anonymous/test auth

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Servo
  gateServo.attach(SERVO_PIN);
  gateServo.write(0); // Initial closed position
}

void loop() {
  // Poll every 1 second (1000 ms)
  if (millis() - lastTime > 1000) {
    lastTime = millis();
    
    if (Firebase.ready()) {
      // Read trigger
      if (Firebase.RTDB.getString(&fbDO, "/trigger/servo")) {
        String trigger = fbDO.stringData();
        
        if (trigger == "OPEN_IN" || trigger == "OPEN_OUT") {
          Serial.println("Trigger received: " + trigger);
          openGate();
          
          // Reset trigger to IDLE
          Firebase.RTDB.setString(&fbDO, "/trigger/servo", "IDLE");
        }
      } else {
        Serial.println(fbDO.errorReason());
      }
    }
  }
}

void openGate() {
  if(!isGateOpen) {
    gateServo.write(90); // Open position
    delay(3000);         // Wait 3 seconds
    gateServo.write(0);  // Close position
  }
}
`;