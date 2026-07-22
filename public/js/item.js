const passwordModal = document.getElementById("passwordModal");
const passwordForm = document.getElementById("passwordForm");

passwordModal.addEventListener("show.bs.modal", (event) => {
  const button = event.relatedTarget;

  const action = button.dataset.action;

  if (action === "update") {
    passwordForm.action = window.location.pathname + "/update";
  } else {
    passwordForm.action = window.location.pathname + "/delete";
  }
});
