/**
 * קובץ הגדרות AbeTube
 * ⚠️ חשוב: קובץ זה מכיל מידע רגיש - אל תשתף אותו בפומבי!
 */

// מפתח YouTube Data API v3
// להחלפה במפתח שלך: https://console.cloud.google.com/apis/credentials
const YOUTUBE_API_KEY = "AIzaSyCKWg2Po9gpQTx2-SSadDOouTB04jBFAAU";

// הגדרות נוספות
const APP_CONFIG = {
    apiKey: YOUTUBE_API_KEY,
    maxResults: 30,           // מספר תוצאות מקסימלי
    defaultQuality: "hd720",  // איכות ברירת מחדל
    autoPlayNext: true,       // ניגון אוטומטי לסרטון הבא
    language: "he",           // שפת תוצאות
    regionCode: "IL"          // קוד אזור (ישראל)
};

// יצוא ההגדרות
if (typeof module !== 'undefined' && module.exports) {
    // עבור Node.js/CommonJS
    module.exports = APP_CONFIG;
} else {
    // עבור דפדפן
    window.APP_CONFIG = APP_CONFIG;
    window.YOUTUBE_API_KEY = YOUTUBE_API_KEY;
}
