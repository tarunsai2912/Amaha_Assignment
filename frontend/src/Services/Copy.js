function addToastStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .copy-toast-container {
        position: fixed;
        top: 2vh;
        right: 2vh;
        display: flex;
        width:23vh;
        align-items: center;
       justify-content: center;
        z-index: 1000;

            height: 7vh;
    border-radius: 0.6vh;
        border: 0.1vh solid rgba(72, 193, 181, 1);
        box-shadow: 0px 4px 16px rgba(16, 11, 39, 0.08);
      }
      
      .copy-toast {
        background-color:rgba(246, 255, 249, 1);
;
        color: black;
            height: 100%;
            width:100%;
            display:flex;
    justify-content: center;
    align-items: center;
    border-radius: 0.6vh;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
      }
        .copy-toast span{
        font-size: 2.3vh;
    font-weight: 600;
    color: rgb(0 0 0)
      
    font-family: "Open Sans", sans-serif;
    font-optical-sizing: auto;
    font-style: normal;
    font-variation-settings: "wdth" 100;
        }
      
      .copy-toast.show {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }
  
  function showToast() {
    addToastStyles();
  
    let toastContainer = document.querySelector(".copy-toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className = "copy-toast-container";
      document.body.appendChild(toastContainer);
    }
  
    const toast = document.createElement("div");
    toast.className = "copy-toast";
  
    const textDiv = document.createElement("span");
    textDiv.innerText = "Link Copied";
  
    toast.appendChild(textDiv);
    toastContainer.appendChild(toast);
  
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);
  
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
        if (toastContainer.childElementCount === 0) {
          toastContainer.remove();
        }
      }, 30);
    }, 2500);
  }
  
  export default showToast;
  