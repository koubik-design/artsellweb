import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
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

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDy6Roy65lq7jQBmZAEjsOaAtjoi91mc5o",
  authDomain: "artbyfish.firebaseapp.com",
  projectId: "artbyfish",
  storageBucket: "artbyfish.firebasestorage.app",
  messagingSenderId: "300548114598",
  appId: "1:300548114598:web:caf025811635087d674c67",
  measurementId: "G-GE3YPXMPT3"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Translations Dictionary
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
    currencySymbol: "Kč"
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
    currencySymbol: "CZK"
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
    currencySymbol: "CZK"
  }
};

let currentLang = 'cz';
let isAdmin = false;

// Language Switching Logic
const langSelect = document.getElementById('lang-select');
langSelect.addEventListener('change', (e) => {
  currentLang = e.target.value;
  updateLanguageUI();
});

function updateLanguageUI() {
  const texts = i18n[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (texts[key]) el.textContent = texts[key];
  });
  updateSliderDisplay();
  renderProducts(); // Re-render product cards with updated button text
}

// Admin Panel Toggle
const adminToggleBtn = document.getElementById('admin-toggle-btn');
const adminPanel = document.getElementById('admin-panel');
adminToggleBtn.addEventListener('click', () => {
  adminPanel.classList.toggle('hidden');
});

// Firebase Auth State
onAuthStateChanged(auth, (user) => {
  const loginForm = document.getElementById('admin-login-form');
  const adminControls = document.getElementById('admin-controls');
  const adminUserEmail = document.getElementById('admin-user-email');

  if (user) {
    isAdmin = true;
    loginForm.classList.add('hidden');
    adminControls.classList.remove('hidden');
    adminUserEmail.textContent = user.email;
  } else {
    isAdmin = false;
    loginForm.classList.remove('hidden');
    adminControls.classList.add('hidden');
  }
  renderProducts();
});

// Login Handler
document.getElementById('login-submit-btn').addEventListener('click', async () => {
  const email = document.getElementById('admin-email').value;
  const pass = document.getElementById('admin-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    alert('Přihlášeno / Logged in!');
  } catch (err) {
    alert('Chyba / Error: ' + err.message);
  }
});

// Logout Handler
document.getElementById('logout-btn').addEventListener('click', () => {
  signOut(auth);
});

// Real-time Firestore Listener
let currentProducts = [];
onSnapshot(collection(db, "products"), (snapshot) => {
  currentProducts = [];
  snapshot.forEach((docSnapshot) => {
    currentProducts.push({
      id: docSnapshot.id,
      ...docSnapshot.data()
    });
  });
  renderProducts();
});

function renderProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  productList.innerHTML = '';
  const texts = i18n[currentLang];

  currentProducts.forEach((item) => {
    // Robust conversion: Converts strings or numbers to a valid number value
    const numericPrice = Number(item.price) || 0;

    const card = document.createElement('div');
    card.className = 'product-card';
    
    let adminEditHTML = '';
    if (isAdmin) {
      adminEditHTML = `
        <div class="admin-edit">
            <input type="number" id="input-${item.id}" value="${numericPrice}" />
            <button class="update-btn" data-id="${item.id}">${texts.updatePrice}</button>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="product-title">${item.title || 'Untitled'}</div>
      <div class="product-desc">${item.description || ''}</div>
      <div class="product-price">${numericPrice} ${texts.currencySymbol}</div>
      <button class="buy-btn" data-stripe-id="${item.stripePriceId || ''}">${texts.buyNow}</button>
      ${adminEditHTML}
    `;
    productList.appendChild(card);
  });

  // Attach update price listeners (for Admin)
  document.querySelectorAll('.update-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const docId = e.target.getAttribute('data-id');
      const newPrice = Number(document.getElementById(`input-${docId}`).value);
      updateDoc(doc(db, "products", docId), { price: newPrice });
    });
  });
}

// Add New Product (Admin)
document.getElementById('add-product-btn').addEventListener('click', async () => {
  const title = document.getElementById('new-title').value;
  const description = document.getElementById('new-desc').value;
  const price = Number(document.getElementById('new-price').value);
  const stripePriceId = document.getElementById('new-stripe-id').value;

  if (!title || !price) {
    alert('Vyplňte název a cenu / Fill in title and price');
    return;
  }

  await addDoc(collection(db, "products"), { title, description, price, stripePriceId });
  alert('Produkt přidán / Product added!');
  document.getElementById('new-title').value = '';
  document.getElementById('new-desc').value = '';
  document.getElementById('new-price').value = '';
  document.getElementById('new-stripe-id').value = '';
});

// CZK Range Slider (20 to 250 CZK, step 5)
const priceInput = document.getElementById('price');
const priceOutput = document.getElementById('price-output');

function updateSliderDisplay() {
  if (priceInput && priceOutput) {
    const symbol = i18n[currentLang].currencySymbol;
    priceOutput.textContent = `${priceInput.value} ${symbol}`;
  }
}

if (priceInput) {
  priceInput.addEventListener('input', updateSliderDisplay);
}

// Save Commission Request to Firestore
const commissionForm = document.getElementById('commission-form');
if (commissionForm) {
  commissionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const description = document.getElementById('description').value;
    const estimatedPriceCZK = Number(priceInput.value);

    await addDoc(collection(db, "commissions"), {
      name,
      email,
      description,
      estimatedPriceCZK,
      createdAt: new Date().toISOString()
    });

    alert('Poptávka byla odeslána! / Request sent!');
    commissionForm.reset();
    updateSliderDisplay();
  });
}

// Initialize UI
updateLanguageUI();
