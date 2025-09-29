(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && 
        !selectHeader.classList.contains('sticky-top') && 
        !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .dropdown > a').forEach(dropdownLink => {
    dropdownLink.addEventListener('click', function(e) {
      if (document.body.classList.contains('mobile-nav-active')) {
        e.preventDefault();
        let parentLi = this.parentNode;
        let dropdownMenu = parentLi.querySelector('ul');

        if (dropdownMenu) {
          dropdownMenu.classList.toggle('dropdown-active');
        }

        parentLi.classList.toggle('active');
      }
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  if (typeof GLightbox !== "undefined") {
    const glightbox = GLightbox({
      selector: '.glightbox'
    });
  }

  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter !== "undefined") {
    new PureCounter();
  }

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    if (typeof Swiper !== "undefined") {
      document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
        let config = JSON.parse(
          swiperElement.querySelector(".swiper-config").innerHTML.trim()
        );

        if (swiperElement.classList.contains("swiper-tab")) {
          initSwiperWithCustomPagination(swiperElement, config);
        } else {
          new Swiper(swiperElement, config);
        }
      });
    }
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function() {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})(); // end IIFE


// =========================
// Login & Button Handler
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const btnAmbil = document.getElementById("btnAmbil");     // untuk penyalur
  const btnBerbagi = document.getElementById("btnBerbagi"); // untuk donatur

  if (btnAmbil) {
    btnAmbil.addEventListener("click", () => {
      window.location.href = "donasi.html";
    });
  }

  if (btnBerbagi) {
    btnBerbagi.addEventListener("click", () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.role === "donatur") {
        window.location.href = "donatur.html";
      } else {
        window.location.href = "login.html";
      }
    });
  }
});


// =========================
// Testimonial Form Handler
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#testimonialForm");
  const swiperContainer = document.querySelector("#testimonials .swiper-wrapper");

  if (!form || !swiperContainer) return;

  let savedTestimonials = JSON.parse(localStorage.getItem("testimonials")) || [];

  // Fungsi render testimoni
  function addTestimonialToSwiper(name, profession, message, photo, rating, save = true) {
    const newSlide = document.createElement("div");
    newSlide.classList.add("swiper-slide");

    let starsHtml = "";
    for (let i = 0; i < rating; i++) {
      starsHtml += `<i class="bi bi-star-fill"></i>`;
    }

    newSlide.innerHTML = `
      <div class="testimonial-item">
        <div class="row gy-4 justify-content-center">
          <div class="col-lg-6">
            <div class="testimonial-content">
              <p>
                <i class="bi bi-quote quote-icon-left"></i>
                <span>${message}</span>
                <i class="bi bi-quote quote-icon-right"></i>
              </p>
              <h3>${name}</h3>
              <h4>${profession}</h4>
              <div class="stars">${starsHtml}</div>
            </div>
          </div>
          <div class="col-lg-2 text-center">
            <img src="${photo}" class="img-fluid testimonial-img" alt="">
          </div>
        </div>
      </div>
    `;

    swiperContainer.appendChild(newSlide);

    if (save) {
      savedTestimonials.push({ name, profession, message, photo, rating });
      localStorage.setItem("testimonials", JSON.stringify(savedTestimonials));
    }

    // Refresh swiper
    if (typeof Swiper !== "undefined") {
      document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
        let config = JSON.parse(swiperElement.querySelector(".swiper-config").innerHTML.trim());
        new Swiper(swiperElement, config);
      });
    }
  }

  // Render semua testimoni dari localStorage
  function renderTestimonials() {
    savedTestimonials.forEach(testi => {
      addTestimonialToSwiper(testi.name, testi.profession, testi.message, testi.photo, testi.rating, false);
    });
  }
  renderTestimonials();

  // Rating handler
  const stars = document.querySelectorAll("#ratingStars i");
  const ratingInput = document.querySelector("input[name='rating']");

  stars.forEach(star => {
    star.addEventListener("click", () => {
      const rating = star.getAttribute("data-value");
      ratingInput.value = rating;

      stars.forEach(s => {
        s.classList.remove("bi-star-fill");
        s.classList.add("bi-star");
      });

      for (let i = 0; i < rating; i++) {
        stars[i].classList.remove("bi-star");
        stars[i].classList.add("bi-star-fill");
      }
    });
  });

// =========================
// Disable php-email-form bawaan
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const testiForm = document.querySelector("#testimonialForm");
  if (testiForm && testiForm.classList.contains("php-email-form")) {
    testiForm.classList.remove("php-email-form");
  }
});

// Submit handler
form.addEventListener("submit", function(e) {
  e.preventDefault();

  const name = form.querySelector('input[name="name"]').value;
  const profession = form.querySelector('input[name="profession"]').value;
  const message = form.querySelector('textarea[name="message"]').value;
  const rating = form.querySelector('input[name="rating"]').value;
  const photoInput = form.querySelector('input[name="photo"]');

  const loadingEl = form.querySelector(".loading");
  const successEl = form.querySelector(".sent-message");

  // tampilkan loading
  loadingEl.style.display = "block";
  successEl.style.display = "none";

  if (photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      const photoBase64 = evt.target.result;

      addTestimonialToSwiper(name, profession, message, photoBase64, rating, true);
      form.reset();

      // reset bintang
      stars.forEach(s => {
        s.classList.remove("bi-star-fill");
        s.classList.add("bi-star");
      });

      // tampilkan sukses
      loadingEl.style.display = "none";
      successEl.style.display = "block";
      setTimeout(() => {
        successEl.style.display = "none";
      }, 3000);
    };
    reader.readAsDataURL(photoInput.files[0]);
  }
});
});
