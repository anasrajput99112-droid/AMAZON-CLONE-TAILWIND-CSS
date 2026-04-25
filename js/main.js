const imgs = document.querySelectorAll("#images");
const prev_btn = document.getElementById("control_prev");
const next_btn = document.getElementById("control_next");

let n = 0;

function changeSlide() {
  if (imgs.length === 0) return;
  for (let i = 0; i < imgs.length; i++) {
    imgs[i].style.display = "none";
  }
  imgs[n].style.display = "block";
}

changeSlide();

if (prev_btn) {
  prev_btn.addEventListener("click", () => {
    if (n > 0) {
      n--;
    } else {
      n = imgs.length - 1;
    }
    changeSlide();
  });
}

if (next_btn) {
  next_btn.addEventListener("click", () => {
    if (n < imgs.length - 1) {
      n++;
    } else {
      n = 0;
    }
    changeSlide();
  });
}

const scrollContainer = document.querySelectorAll(".product");

for (const item of scrollContainer) {
  item.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    item.scrollLeft += evt.deltaY;
  });
}

// --- GLOBAL AUTHENTICATION STATE --- //
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("currentUser");
  const authLinks = document.querySelectorAll('a');
  
  if (currentUser) {
    authLinks.forEach(link => {
      if (link.textContent.includes('Hello, Sign in') || (link.href && link.href.includes('signin.html') && link.textContent.includes('Hello,'))) {
        link.innerHTML = `Hello, ${currentUser} <br><span id="signOutBtn" class="text-blue-400 hover:text-red-500 hover:underline cursor-pointer text-[12px] mt-1 relative z-50 inline-block pointer-events-auto">Sign Out</span>`;
        link.href = '#'; 
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target && e.target.id === "signOutBtn") {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.reload();
      }
    });
  }

  function requireAuth(e) {
    if (!localStorage.getItem("currentUser")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      alert("Please sign in first to proceed.");
      window.location.href = window.location.pathname.includes('/page/') ? 'signin.html' : './page/signin.html';
    }
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", requireAuth, true);
    checkoutBtn.addEventListener("click", () => {
       window.location.href = window.location.pathname.includes('/page/') ? 'checkout.html' : './page/checkout.html';
    });
  }

  const buyNowBtn = document.getElementById("buyNowBtn");
  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", requireAuth, true);
    buyNowBtn.addEventListener("click", () => {
       const globalAddToCartBtn = document.getElementById("addToCartBtn");
       if (globalAddToCartBtn) { globalAddToCartBtn.click(); }
       window.location.href = window.location.pathname.includes('/page/') ? 'checkout.html' : './page/checkout.html';
    });
  }

  const globalAddToCartBtn = document.getElementById("addToCartBtn");
  if (globalAddToCartBtn) {
    globalAddToCartBtn.addEventListener("click", requireAuth, true);
  }

  // --- SIGN UP LOGIC --- //
  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const mobile = document.getElementById("signupMobile").value.trim();
      const pass = document.getElementById("signupPassword").value;
      const errorMsg = document.getElementById("signupError");

      if (!name || !email || !mobile || !pass) {
        errorMsg.textContent = "Please fill in all fields.";
        errorMsg.classList.remove("hidden");
        return;
      }

      if (pass.length < 6) {
        errorMsg.textContent = "Password must be at least 6 characters.";
        errorMsg.classList.remove("hidden");
        return;
      }

      let users = JSON.parse(localStorage.getItem("amazonUsers")) || [];
      const userExists = users.find(u => u.email === email || u.mobile === mobile);
      if (userExists) {
        errorMsg.textContent = "User already exists with this email or mobile.";
        errorMsg.classList.remove("hidden");
        return;
      }

      users.push({ name, email, mobile, pass });
      localStorage.setItem("amazonUsers", JSON.stringify(users));
      
      alert("Account created successfully!");
      window.location.href = "signin.html";
    });
  }

  // --- SIGN IN LOGIC --- //
  const signinBtn = document.getElementById("signinBtn");
  if (signinBtn) {
    signinBtn.addEventListener("click", () => {
      const emailOrPhone = document.getElementById("signinEmail").value.trim();
      const pass = document.getElementById("signinPassword").value;
      const errorMsg = document.getElementById("signinError");

      if (!emailOrPhone || !pass) {
        errorMsg.textContent = "Please enter your email/mobile and password.";
        errorMsg.classList.remove("hidden");
        return;
      }

      let users = JSON.parse(localStorage.getItem("amazonUsers")) || [];
      const user = users.find(u => (u.email === emailOrPhone || u.mobile === emailOrPhone) && u.pass === pass);
      
      if (!user) {
        errorMsg.textContent = "Incorrect email/mobile or password.";
        errorMsg.classList.remove("hidden");
        return;
      }

      localStorage.setItem("currentUser", user.name);
      window.location.href = "../index.html";
    });
  }

  // --- ADD TO CART FROM INDEX LOGIC --- //
  // This helps when clicking directly on product items/images in the main index.html
  if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
    const productItems = document.querySelectorAll(".product a, .product .flex-col, section > div > .flex-col");
    
    productItems.forEach((item, index) => {
      item.addEventListener("click", (e) => {
        // Find if this visually serves as a product link or clickable card
        const imgEl = item.querySelector("img");
        if (!imgEl) return;
        
        e.preventDefault();

        const titleEl = item.querySelector("h4") || item.querySelector("h3");
        const priceEl = item.querySelector("span.font-\\[700\\]");

        let price = 19.99; // Fallback price
        if (priceEl && priceEl.innerText) {
          price = parseFloat(priceEl.innerText) || 19.99;
        }

        let title = "Amazon Product";
        if (titleEl && titleEl.innerText) {
          title = titleEl.innerText;
        } else if (imgEl.alt && imgEl.alt.trim() !== "") {
          title = imgEl.alt;
        }

        let img = imgEl.getAttribute("src");
        // Fix relative paths for cart.html (cart is inside /page/)
        if (img && img.startsWith("./")) {
          img = img.substring(1); // becomes /assets/...
        }

        let id = "idx_p" + index;
        if (item.tagName === 'A' && item.href.includes("?id=")) {
          const params = new URL(item.href).searchParams;
          if (params.has("id")) {
             id = params.get("id");
          }
        }

        const productData = {
          id: id,
          title: title,
          img: img,
          price: price,
          quantity: 1,
          description: "This is a premium product featuring excellent build quality and fantastic value. Add it to your cart today to enjoy fast shipping and dedicated customer support!"
        };

        // Instead of adding directly to cart, we navigate to the product detail page
        localStorage.setItem("selectedProduct", JSON.stringify(productData));
        window.location.href = "./page/product.html?id=" + id;
      });
    });
  }

});
