const searchInput = document.getElementById("searchInput");
    const posts = document.querySelectorAll("#postContainer .col-lg-6");
    searchInput.addEventListener("keyup", function () {
      const keyword = this.value.toLowerCase();
      posts.forEach(post => {
        const text = post.innerText.toLowerCase();
        post.style.display = text.includes(keyword) ? "" : "none";
      });
    });

    // Galeri Gambar Feed
    document.querySelectorAll(".feed-gallery").forEach(gallery => {
      const mainImg = gallery.querySelector(".main-img");
      const thumbs = gallery.querySelectorAll(".thumb");
      thumbs.forEach(thumb => {
        thumb.addEventListener("click", () => {
          mainImg.src = thumb.src;
          thumbs.forEach(t => t.classList.remove("active"));
          thumb.classList.add("active");
        });
      });
    });