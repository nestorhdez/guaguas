// Check for service worker
if ("serviceWorker" in navigator && 'PushManager' in window) {
  registerWorker().catch(err => console.error(err));
}

/**
 * Register the service worker and subscribe the pushManager
 */
async function registerWorker() {
  const publicVapidKey =
  "BMcf8IhZibDCv0HCXDwkX1z3Fr64Q7lZ7qLKxC2512PqzqWHWqBm17h0o-BZRfi4Sn1XNRZMV9xxfW3bRKLDIfA";

  // Register Service Worker
  const register = await navigator.serviceWorker.register("/sw.js", {
    scope: "/"
  });

  // Register Push
  await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
}

/**
 * Get the push manager subscription and fetch the api with it to trigger the push notification
 */
async function getNotification() {

  const busStop = document.querySelector('#bus-stop').value;
  const line = document.querySelector('#line').value;

  const subscription = await navigator.serviceWorker.ready.then(
    reg => reg.pushManager.getSubscription()
  );

  if(!subscription || !busStop) {
    return;
  }

  const baseUrl = new URL("https://guaguas.netlify.app/.netlify/functions/notification");
  busStop && baseUrl.searchParams.set('busStop', busStop);
  line && baseUrl.searchParams.set('line', line);
  const url = baseUrl.toString();

  await fetch(url, {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json"
    }
  });
}

document.querySelector("#notification").addEventListener("click", async () => {
  await getNotification();
});

/**
 * Convert a base64 string into Uint8Array
 * @param {string} base64String 
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
