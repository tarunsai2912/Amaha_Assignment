
import "./Toast.css";
import redCrossIcon from "../../Assets/redCrossIcon (1).png";
import checkIcon from "../../Assets/checkIcon (1).png";

function showToast(message, checker) {
  let toastContainer = document.querySelector(".toast-container");

  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast";

  const img = document.createElement("img");
  img.style.width = "3vh";
  img.style.height = "3vh";
  const textDiv = document.createElement("span");
  textDiv.innerText = message;

  const mover = document.createElement("div");
  mover.className = checker ? "mover" : "mover_error";

  let changer = 98;
  img.src = checker ? checkIcon : redCrossIcon;
  toast.appendChild(img);
  toast.appendChild(textDiv);

  function moverFunction() {
    mover.style.width = `${changer}%`;

    if (changer > 0) {
      changer -= 1;
    } else {
      clearInterval(interval);
    }
  }

  const interval = setInterval(moverFunction, 30);

  toastContainer.appendChild(toast);
  toastContainer.appendChild(mover);

  setTimeout(() => {
    toast.classList.add("show");
    mover.classList.add("mover2");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    mover.classList.remove("mover2");

    setTimeout(() => {
      toast.remove();
      mover.remove();
      
     
      if (toastContainer.childElementCount === 0) {
        toastContainer.remove();
      }
    }, 10);
  }, 3000);
}

export default showToast;