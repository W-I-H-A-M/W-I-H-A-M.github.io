/**
 * Displays a notification with a given type, content, and duration.
 * Automatically removes the notification after the specified duration.
 */
function showNotification({ type = "info", content = "", duration = 5000 }) {
  // Obtain the main container for notifications
  const container = document.getElementById("notificationContainer");

  // Create the notification element with dynamic type
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;

  // Create and set the notification content
  const notificationContent = document.createElement("div");
  notificationContent.className = "content";
  notificationContent.innerHTML = content;

  // Create a close button to manually remove the notification
  const closeButton = document.createElement("button");
  closeButton.className = "close-btn";
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => removeNotification(notification);

  // Assemble the notification components
  notification.appendChild(notificationContent);
  notification.appendChild(closeButton);

  // Add the notification to the container
  container.appendChild(notification);

  // Automatically remove the notification after a given duration
  if (duration > 0) {
    setTimeout(() => removeNotification(notification), duration);
  }
}

/**
 * Applies a fade-out animation and removes the notification node
 * from the DOM once the animation is complete.
 */
function removeNotification(notification) {
  notification.style.animation = "fadeOut 0.3s ease-out";
  notification.addEventListener("animationend", () => {
    notification.remove();
  });
}
