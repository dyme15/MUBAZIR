document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("isDonaturLogin");
    window.location.href = "index.html";
  });