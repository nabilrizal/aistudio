import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Configuration from the user's google-services.json and prompt
const firebaseConfig = {
  apiKey: "AIzaSyAE52-trnyGUnQvW6Z1z55DG88j466Ogyo",
  databaseURL: "https://nfc-parking-v3-default-rtdb.firebaseio.com",
  projectId: "nfc-parking-v3",
  storageBucket: "nfc-parking-v3.firebasestorage.app",
  appId: "1:243588607852:android:fcf4fdf71e9c48f5b8cd49"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);