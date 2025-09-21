  document.querySelector("form").addEventListener("submit", function(e) {
    e.preventDefault();
    // contoh validasi dummy (harusnya ke backend)
    localStorage.setItem("isDonaturLogin", "true");
    window.location.href = "dashboard_donatur.html";
  });

