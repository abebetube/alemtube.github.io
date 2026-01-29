/**
 * גיבוי - מפתח API ציבורי חינמי (מוגבל לשימוש)
 * ⚠️ זה מפתח ציבורי - לא להשתמש לפרויקטים גדולים
 */

// המפתח שלך (אם עובד)
const YOUR_API_KEY = "AIzaSyCaKQjUG_XZmKFoD4_hKfMRew9h_UTOzN4";

// מפתח גיבוי ציבורי (מוגבל)
const BACKUP_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

// בדוק איזה מפתח עובד
window.YOUTUBE_API_KEY = YOUR_API_KEY;

console.log("Config loaded - Using API key:", YOUR_API_KEY.substring(0, 10) + "...");
