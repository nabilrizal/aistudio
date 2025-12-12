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

export const ANDROID_MANIFEST = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.eparking.nfc">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.NFC" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="E-Parking NFC"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.EParking">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            <!-- NFC Tech Filter -->
            <intent-filter>
                <action android:name="android.nfc.action.TECH_DISCOVERED" />
            </intent-filter>
            <meta-data
                android:name="android.nfc.action.TECH_DISCOVERED"
                android:resource="@xml/nfc_tech_filter" />
        </activity>
    </application>
</manifest>`;

export const ANDROID_GRADLE = `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'com.google.gms.google-services'
}

android {
    namespace 'com.eparking.nfc'
    compileSdk 34

    defaultConfig {
        applicationId "com.eparking.nfc"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    
    // Firebase
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-database'
}`;

export const ANDROID_ACTIVITY = `package com.eparking.nfc

import android.app.PendingIntent
import android.content.Intent
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.os.Bundle
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import java.util.Date

class MainActivity : AppCompatActivity() {

    private var nfcAdapter: NfcAdapter? = null
    private var pendingIntent: PendingIntent? = null
    private lateinit var statusText: TextView

    // Firebase
    private val db = FirebaseDatabase.getInstance().reference

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statusText = findViewById(R.id.tvStatus)
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)

        if (nfcAdapter == null) {
            Toast.makeText(this, "NFC not supported", Toast.LENGTH_LONG).show()
            return
        }

        // Setup NFC Intent
        val intent = Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_MUTABLE)
    }

    override fun onResume() {
        super.onResume()
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, null, null)
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter?.disableForegroundDispatch(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (NfcAdapter.ACTION_TAG_DISCOVERED == intent.action || 
            NfcAdapter.ACTION_TECH_DISCOVERED == intent.action) {
            
            val tag: Tag? = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
            val uid = tag?.id?.joinToString("") { "%02X".format(it) }
            
            if (uid != null) {
                processParkingLogic(uid)
            }
        }
    }

    private fun processParkingLogic(uid: String) {
        statusText.text = "Processing Card: $uid..."
        
        db.child("config").get().addOnSuccessListener { configSnap ->
            val biayaParkir = configSnap.child("biaya_parkir").getValue(Long::class.java) ?: 3000
            val mode = configSnap.child("mode_parkir").getValue(String::class.java) ?: "FLAT"
            
            db.child("users").child(uid).get().addOnSuccessListener { userSnap ->
                if (!userSnap.exists()) {
                    showAlert("Error", "Kartu $uid tidak terdaftar!")
                    return@addOnSuccessListener
                }

                val isParked = userSnap.child("is_parked").getValue(Boolean::class.java) ?: false
                val saldo = userSnap.child("saldo").getValue(Long::class.java) ?: 0
                val lastEntry = userSnap.child("last_entry").getValue(Long::class.java) ?: 0
                val currentTime = System.currentTimeMillis() / 1000

                if (!isParked) {
                    // --- TAP IN ---
                    if (saldo < biayaParkir) {
                        showAlert("Gagal Masuk", "Saldo Kurang!")
                    } else {
                        val updates = hashMapOf<String, Any>(
                            "users/$uid/is_parked" to true,
                            "users/$uid/last_entry" to currentTime,
                            "trigger/servo" to "OPEN_IN"
                        )
                        db.updateChildren(updates)
                        logTransaction(uid, "MASUK", 0, "SUKSES")
                        showAlert("Berhasil", "Silakan Masuk. Gate Terbuka.")
                    }
                } else {
                    // --- TAP OUT ---
                    val durationSeconds = currentTime - lastEntry
                    val durationHours = Math.ceil(durationSeconds / 3600.0).toLong()
                    
                    var cost = biayaParkir
                    if (mode == "PER_JAM") {
                        cost = biayaParkir * (if (durationHours == 0L) 1 else durationHours)
                    }

                    if (saldo >= cost) {
                        val updates = hashMapOf<String, Any>(
                            "users/$uid/is_parked" to false,
                            "users/$uid/saldo" to (saldo - cost),
                            "users/$uid/last_entry" to 0,
                            "trigger/servo" to "OPEN_OUT"
                        )
                        db.updateChildren(updates)
                        logTransaction(uid, "KELUAR", cost, "SUKSES")
                        showAlert("Berhasil Keluar", "Biaya: Rp $cost\\nSisa Saldo: Rp \${saldo - cost}")
                    } else {
                         logTransaction(uid, "KELUAR", cost, "GAGAL")
                         showAlert("Gagal Keluar", "Saldo Tidak Cukup!\\nBiaya: $cost\\nSaldo: $saldo")
                    }
                }
            }
        }
    }

    private fun logTransaction(uid: String, action: String, biaya: Long, status: String) {
        val logKey = db.child("logs").push().key ?: return
        val logData = hashMapOf(
            "uid" to uid,
            "action" to action,
            "biaya" to biaya,
            "status" to status,
            "timestamp" to System.currentTimeMillis() / 1000
        )
        db.child("logs").child(logKey).setValue(logData)
    }

    private fun showAlert(title: String, msg: String) {
        statusText.text = msg
        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(msg)
            .setPositiveButton("OK", null)
            .show()
    }
}`;