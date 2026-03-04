/**
 * GOURMET -> RESTAURANT YONETIM 
 * Firebase Security & Init
 */

// Basic obfuscation for API keys and Admin Credentials
// Not true security, but prevents basic bot scraping on GitHub
const _a = atob("QUl6YVN5RHZob1UtZjhMNTctX1VubGdSUTJiby1lSGVIWkh6QW1r");
const _d = atob("cmVzdG9yYW4teW9uZXRpbS5maXJlYmFzZWFwcC5jb20=");
const _p = atob("cmVzdG9yYW4teW9uZXRpbQ==");
const _s = atob("cmVzdG9yYW4teW9uZXRpbS5maXJlYmFzZXN0b3JhZ2UuYXBw");
const _m = atob("NDcxOTI2MTkwOTE4");
const _i = atob("MTo0NzE5MjYxOTA5MTg6d2ViOjgxYzE1YTgzM2YwZDcyMjk4ZDZiNDc=");

const firebaseConfig = {
    apiKey: _a,
    authDomain: _d,
    databaseURL: "https://restoran-yonetim-default-rtdb.firebaseio.com",
    projectId: _p,
    storageBucket: _s,
    messagingSenderId: _m,
    appId: _i
};

// Initialize Firebase via compat libraries
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
window.db = db; // Make accessible globally

// Encoded Admin Credentials
window.DB_ADMIN_U = atob("Y2luYXJ4MDRAZ21haWwuY29t");
window.DB_ADMIN_P = atob("MTIzNDU2Nzg5YWJjLg==");
