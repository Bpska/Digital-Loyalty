import { api } from "./api";

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush() {
  try {
    if (typeof window === "undefined") return;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications are not supported in this browser.");
      return;
    }

    // 1. Wait for Service Worker registration to be ready
    const registration = await navigator.serviceWorker.ready;
    if (!registration.pushManager) {
      console.warn("PushManager not available on ServiceWorkerRegistration.");
      return;
    }

    // 2. Fetch VAPID public key dynamically from the backend
    const res = await api.get("/notifications/vapid-key");
    const vapidPublicKey = res.data?.publicKey;
    if (!vapidPublicKey) {
      console.warn("VAPID public key not found or configured on backend.");
      return;
    }

    // 3. Request browser notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission was not granted.");
      return;
    }

    // 4. Check if an active subscription already exists
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // 5. If not, subscribe the user
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // 6. Send the subscription payload to the backend
    await api.post("/notifications/subscribe", { subscription });
    console.log("Successfully registered user push subscription on backend.");
  } catch (err) {
    console.error("Error subscribing user to push notifications:", err);
  }
}
