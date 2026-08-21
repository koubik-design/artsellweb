import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Stripe Initialization
const stripe = Stripe('pk_live_51O6zRIGuq8JDS1f7KpL6ozOEbZJVk0BtkNN2ZoJvWZWXg5ny7pf9oKs9YUzGQuphH5f8qdfVTqP2ViBCu9ZKNqCu00KH3PHvzZ');

const firebaseConfig = {
  apiKey: "AIzaSyDy6Roy65lq7jQBmZAEjsOaAtjoi91mc5o",
  authDomain: "artbyfish.firebaseapp.com",
  projectId: "artbyfish",
  storageBucket: "artbyfish.firebasestorage.app",
  messagingSenderId: "300548114598",
  appId: "1:300548114598:web:caf025811635087d674c67"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const i18n = {
  cz: {
    subtitle: "Originální díla a zakázková tvorba",
    availableWorks: "Dostupná díla",
    commissionTitle: "Zakázková tvorba",
    name: "Jméno",
    email: "E-mail",
    conceptDesc: "Popis konceptu",
    budgetEstimate: "Odhad rozpočtu",
    submitRequest: "Odeslat poptávku",
    adminLogin: "Admin Přihlášení",
    adminTitle: "Admin Přístup",
    login: "Přihlásit se",
    logout: "Odhlásit se",
    loggedInAs: "Přihlášen jako:",
    addNewProduct: "Přidat nový produkt",
    saveProduct: "Uložit produkt",
    buyNow: "Koupit nyní",
    updatePrice: "Upravit cenu",
    currencySymbol: "Kč",
    sold: "PRODÁNO",
    toggleSold: "Změnit stav prodáno"
  },
  en: {
    subtitle: "Original pieces & custom commissions",
    availableWorks: "Available Works",
    commissionTitle: "Custom Commission",
    name: "Name",
    email: "Email",
    conceptDesc: "Concept Description",
    budgetEstimate: "Budget Estimate",
    submitRequest: "Submit Request",
    adminLogin: "Admin Login",
    adminTitle: "Admin Access",
    login: "Log In",
    logout: "Log Out",
    loggedInAs: "Logged in as:",
    addNewProduct: "Add New Product",
    saveProduct: "Save Product",
    buyNow: "Buy Now",
    updatePrice: "Update Price",
    currencySymbol: "CZK",
    sold: "SOLD OUT",
    toggleSold: "Toggle Sold Status"
  },
  de: {
    subtitle: "Originale & Auftragsarbeiten",
    availableWorks: "Verfügbare Werke",
    commissionTitle: "Auftragsarbeit",
    name: "Name",
    email: "E-Mail",
    conceptDesc: "Konzeptbeschreibung",
    budgetEstimate: "Budgetschätzung",
    submitRequest: "Anfrage Absenden",
    adminLogin: "Admin Login",
    adminTitle: "Admin-Zugang",
    login: "Anmelden",
    logout: "Abmelden",
    loggedInAs: "Angemeldet als:",
    addNewProduct: "Neues Produkt hinzufügen",
    saveProduct: "Produkt Speichern",
    buyNow: "Jetzt Kaufen",
    updatePrice: "Preis Ändern",
    currencySymbol: "CZK",
    sold: "VERKAUFT",
    toggleSold: "Status ändern"
  }
};

let currentLang = 'cz';
let isAdmin = false;

// Language Switcher
const langSelect = document.getElementById('lang-select');
if (langSelect) {
  langSelect.onchange = (e) => {
    currentLang = e.target.value;
    renderProducts();
  };
}

// Commission Slider Value Binding
const priceInput = document.getElementById('price');
const priceOutput = document.getElementById('price-output');
if (priceInput && priceOutput) {
  priceInput.oninput = (e) => {
    priceOutput.textContent = `${e.target.value} Kč`;
  };
}

// Authentication State Listener
onAuthStateChanged(auth, (user) => {
  isAdmin = !!user;
  document.getElementById('admin-login-form')?.classList.toggle('hidden', isAdmin);
  document.getElementById('admin-controls')?.classList.toggle('hidden', !isAdmin);
  document.getElementById('admin-commissions-section')?.classList.toggle('hidden', !isAdmin);
  if (user) {
    const userEmailEl = document.getElementById('admin-user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;
  }
  renderProducts();
});

// Real-time Firestore Products Snapshot
let currentProducts = [];
onSnapshot(collection(db, "products"), (snapshot) => {
  currentProducts = [];
  snapshot.forEach((docSnapshot) => {
    currentProducts.push({ id: docSnapshot.id, ...docSnapshot.data() });
  });
  renderProducts();
});

// Real-time Firestore Commissions Snapshot (Admin View)
onSnapshot(collection(db, "commissions"), (snapshot) => {
  const commList = document.getElementById('commission-list');
  if (!commList) return;
  commList.innerHTML = '';

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const card = document.createElement('div');
    card.className = 'commission-card';
    card.innerHTML = `
      <h4>${data.name || 'Neznámý'} (${data.email || 'Bez e-mailu'})</h4>
      <p><strong>Rozpočet:</strong> ${data.estimatedPriceCZK || 0} Kč</p>
      <p>${data.description || ''}</p>
    `;
    commList.appendChild(card);
  });
});

// Render Product Gallery and Admin Controls
function renderProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  productList.innerHTML = '';
  const texts = i18n[currentLang];

  currentProducts.forEach((item) => {
    const numericPrice = Number(item.price) || 0;
    const card = document.createElement('div');
    card.className = 'product-card';

    const defaultImg = "https://via.placeholder.com/400x300?text=Artwork";
    const imgUrl = item.imageUrl || defaultImg;

    let adminControlsHTML = '';
    if (isAdmin) {
      adminControlsHTML = `
        <div class="admin-edit" style="margin-top: 8px; display: flex; gap: 8px;">
            <input type="number" id="input-${item.id}" value="${numericPrice}" style="width: 100px;" />
            <button class="update-btn" data-id="${item.id}">${texts.updatePrice}</button>
            <button class="toggle-sold-btn danger-btn" data-id="${item.id}" data-sold="${item.isSold || false}">${texts.toggleSold}</button>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="product-image-container">
        <img src="${imgUrl}" class="product-img" alt="${item.title}">
        ${item.isSold ? `<span class="sold-badge">${texts.sold}</span>` : ''}
      </div>
      <div class="product-title">${item.title || 'Untitled'}</div>
      <div class="product-desc">${item.description || ''}</div>
      <div class="product-price">${numericPrice} ${texts.currencySymbol}</div>
      <button class="buy-btn" data-id="${item.id}" ${item.isSold ? 'disabled style="opacity:0.5;"' : ''}>${item.isSold ? texts.sold : texts.buyNow}</button>
      ${adminControlsHTML}
    `;

    productList.appendChild(card);
  });

  // Attach Stripe Checkout Click Handlers with Debug Alerts
  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.onclick = async (e) => {
      const docId = e.target.getAttribute('data-id');
      const product = currentProducts.find(p => p.id === docId);

      if (!product) {
        alert('Product data missing.');
        return;
      }

      if (!product.stripePriceId) {
        alert(`Missing Stripe Price ID for "${product.title}". Check database field "stripePriceId".`);
        return;
      }

      try {
        const { error } = await stripe.redirectToCheckout({
          lineItems: [{ price: String(product.stripePriceId).trim(), quantity: 1 }],
          mode: 'payment',
          successUrl: window.location.origin + '/success.html',
          cancelUrl: window.location.origin + '/cancel.html',
        });

        if (error) {
          alert('Stripe Error: ' + error.message);
        }
      } catch (err) {
        alert('Checkout Exception: ' + err.message);
      }
    };
  });

  // Admin Update Price Handler
  document.querySelectorAll('.update-btn').forEach(btn => {
    btn.onclick = (e) => {
      const docId = e.target.getAttribute('data-id');
      const newPrice = Number(document.getElementById(`input-${docId}`).value);
      updateDoc(doc(db, "products", docId), { price: newPrice });
    };
  });

  // Admin Toggle Sold Handler
  document.querySelectorAll('.toggle-sold-btn').forEach(btn => {
    btn.onclick = (e) => {
      const docId = e.target.getAttribute('data-id');
      const currentSold = e.target.getAttribute('data-sold') === 'true';
      updateDoc(doc(db, "products", docId), { isSold: !currentSold });
    };
  });
}

// Add New Product with Storage Upload
const addProductBtn = document.getElementById('add-product-btn');
if (addProductBtn) {
  addProductBtn.onclick = async () => {
    const title = document.getElementById('new-title').value;
    const description = document.getElementById('new-desc').value;
    const price = Number(document.getElementById('new-price').value);
    const stripePriceId = document.getElementById('new-stripe-id').value;
    const fileInput = document.getElementById('new-image');
    const file = fileInput.files[0];

    if (!title || !price) {
      alert('Vyplňte název a cenu');
      return;
    }

    let imageUrl = "";
    if (file) {
      const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      imageUrl = await getDownloadURL(fileRef);
    }

    await addDoc(collection(db, "products"), {
      title, 
      description, 
      price, 
      stripePriceId: stripePriceId.trim(), 
      imageUrl, 
      isSold: false
    });

    alert('Produkt úspěšně vytvořen!');
    document.getElementById('new-title').value = '';
    document.getElementById('new-desc').value = '';
    document.getElementById('new-price').value = '';
    document.getElementById('new-stripe-id').value = '';
    fileInput.value = '';
  };
}

// Submit Custom Commission Request
const commissionForm = document.getElementById('commission-form');
if (commissionForm) {
  commissionForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const description = document.getElementById('description').value;
    const estimatedPriceCZK = Number(document.getElementById('price').value);

    await addDoc(collection(db, "commissions"), {
      name, email, description, estimatedPriceCZK, createdAt: new Date()
    });

    alert('Poptávka byla úspěšně odeslána!');
    commissionForm.reset();
  };
}

// Admin Panel Toggle & Auth Handlers
const adminToggleBtn = document.getElementById('admin-toggle-btn');
if (adminToggleBtn) {
  adminToggleBtn.onclick = () => {
    document.getElementById('admin-panel')?.classList.toggle('hidden');
  };
}

const loginSubmitBtn = document.getElementById('login-submit-btn');
if (loginSubmitBtn) {
  loginSubmitBtn.onclick = async () => {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-password').value;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      alert(err.message);
    }
  };
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.onclick = () => signOut(auth);
}
