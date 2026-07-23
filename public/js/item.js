const passwordModal = document.getElementById("passwordModal");
const passwordForm = document.getElementById("passwordForm");

passwordModal.addEventListener("show.bs.modal", (event) => {
  const button = event.relatedTarget;

  const action = button.dataset.action;

  switch (action) {
    case "update":
      passwordForm.action = window.location.pathname + "/update/verify";
      break;

    case "delete":
      passwordForm.action = window.location.pathname + "/delete";
      break;

    case "delete-category":
      passwordForm.action =
        "/categories/" + window.location.pathname.split("/")[1] + "/delete";
      break;
  }
});
