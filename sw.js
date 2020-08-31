self.addEventListener("push", e => {
  const { title, body } = e.data.json();

  self.registration.showNotification(title, {
    body,
    icon: '/assets/guagua.png'
  });
});
