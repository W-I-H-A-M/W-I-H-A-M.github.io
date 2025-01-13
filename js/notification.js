//notification.js

function showNotification({ type = "info", content = "", duration = 5000 }) {
    const container = document.getElementById("notificationContainer");
  
    // Benachrichtigung erstellen
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
  
    // Inhalt
    const notificationContent = document.createElement("div");
    notificationContent.className = "content";
    notificationContent.innerHTML = content;
  
    // Schließen-Button
    const closeButton = document.createElement("button");
    closeButton.className = "close-btn";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = () => removeNotification(notification);
  
    notification.appendChild(notificationContent);
    notification.appendChild(closeButton);
  
    container.appendChild(notification);
  
    // Automatisches Entfernen nach Ablauf der Zeit
    if (duration > 0) {
      setTimeout(() => removeNotification(notification), duration);
    }
  }
  
  function removeNotification(notification) {
    notification.style.animation = "fadeOut 0.3s ease-out";
    notification.addEventListener("animationend", () => {
      notification.remove();
    });
  }
  
  /* Beispielaufrufe
  showNotification({
    type: "success",
    content: "<strong>Speichern erfolgreich!</strong> Die Daten wurden gespeichert.",
    duration: 3000,
  });
  
  showNotification({
    type: "error",
    content: "<strong>Fehler:</strong> Etwas ist schief gelaufen!",
    duration: 0,
  });

  showNotification({
    type: "info",
    content: "<strong>Info:</strong> Something is happening!",
    duration: 0,
  });
  
  showNotification({
    type: "warning",
    content: "<strong>Warnung:</strong> This field is empty!",
    duration: 3000, 
  });
  */
 