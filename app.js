import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  query,
  orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

const i18n = {
  cz: {
    subtitle: "Originální díla a zakázková tvorba",
    availableWorks: "Dostupná díla",
    commissionTitle: "Zakázková tvorba",
    namePlaceholder: "Vaše Jméno",
    emailPlaceholder: "Váš E-mail",
    conceptDescPlaceholder: "Popis konceptu",
    budgetEstimate: "Odhad rozpočtu:",
    submitRequest: "Odeslat poptávku",
    adminLogin: "Přihlásit se",
    adminTitle: "Admin Access",
    logout: "Odhlásit se",
    loggedInAs: "Přihlášen jako:",
    addNewProduct: "Přidat nový produkt",
    saveProduct: "Uložit produkt",
    buyNow: "Koupit nyní",
    updatePrice: "Upravit cenu",
    deleteItem: "Smazat",
    currencySymbol: "Kč",
    sold: "PRODÁNO",
    toggleSold: "Změnit stav prodáno",
    searchPlaceholder: "Hledat dílo...",
    filterHideSold: "Skrýt prodané",
    statusPending: "Čeká",
    statusCompleted: "Dokončeno"
  },
  en: {
    subtitle: "Original pieces & custom commissions",
    availableWorks: "Available Works",
    commissionTitle: "Custom Commission",
    namePlaceholder: "Your Name",
    emailPlaceholder: "Your Email",
    conceptDescPlaceholder: "Concept Description",
    budgetEstimate: "Budget Estimate:",
    submitRequest: "Submit Request",
    adminLogin: "Log In",
    adminTitle: "Admin Access",
    logout: "Log Out",
    loggedInAs: "Logged in as:",
    addNewProduct: "Add New Product",
    saveProduct: "Save Product",
    buyNow: "Buy Now",
    updatePrice: "Update Price",
    deleteItem: "Delete",
    currencySymbol: "CZK",
    sold: "SOLD OUT",
    toggleSold: "Toggle Sold Status",
    searchPlaceholder: "Search artwork...",
    filterHideSold: "Hide sold items",
    statusPending: "Pending",
    statusCompleted: "Completed"
  },
  de: {
    subtitle: "Originale & Auftragsarbeiten",
    availableWorks: "Verfügbare Werke",
    commissionTitle: "Auftragsarbeit",
    namePlaceholder: "Ihr Name",
    emailPlaceholder: "Ihre E-Mail",
    conceptDescPlaceholder: "Konzeptbeschreibung",
    budgetEstimate: "Budgetschätzung:",
    submitRequest: "Anfrage Absenden",
    adminLogin: "Anmelden",
    adminTitle: "Admin Access",
    logout: "Abmelden",
    loggedInAs: "Angemeldet als:",
    addNewProduct: "Neues Produkt hinzufügen",
    saveProduct: "Produkt Speichern",
    buyNow: "Jetzt Kaufen",
    updatePrice: "Preis Ändern",
    deleteItem: "Löschen",
    currencySymbol: "CZK",
    sold: "VERKAUFT",
    toggleSold: "Status ändern",
    searchPlaceholder: "Kunstwerk suchen...",
    filterHideSold: "Verkaufte ausblenden",
    statusPending: "Ausstehend",
    statusCompleted: "Abgeschlossen"
  }
};

let currentLang = 'cz';
let isAdmin = false;
let currentProducts = [];
let searchQuery = '';
let hideSold = false;

// Dynamic UI Language Updates
function updateLanguageUI() {
  const texts = i18n[currentLang];
  
  const subtitleEl = document.getElementById('subtitle-text');
  if (subtitleEl) subtitleEl.textContent = texts.subtitle;

  const worksHeader = document.querySelector('section.panel h2');
  if (worksHeader) worksHeader.textContent = texts.availableWorks;

  const nameInput = document.getElementById('name');
  if (nameInput) nameInput.placeholder = texts.namePlaceholder;

  const emailInput = document.getElementById('email');
  if (emailInput) emailInput.placeholder = texts.emailPlaceholder;

  const descInput = document.getElementById('description');
  if (descInput) descInput.placeholder = texts.conceptDescPlaceholder;

  const submitBtn = document.querySelector('#commission-form button[type="submit"]');
  if (submitBtn) submitBtn.textContent = texts.submitRequest;

  renderProducts();
}

// Language Switcher Listener
const langSelect = document.getElementById('lang-select');
if (langSelect) {
  langSelect.onchange = (e) => {
    currentLang = e.target.value;
    updateLanguageUI();
  };
}

// Commission Slider Value Listener
const priceInput = document.getElementById('price');
const priceOutput = document.getElementById('price-output');
if (priceInput && priceOutput) {
  priceInput.oninput = (e) => {
    priceOutput.textContent = `${e.target.value} ${i18n[currentLang].currencySymbol}`;
  };
}

// Authentication Listener
onAuthStateChanged(auth, (user) => {
  isAdmin = !!user;
  document.getElementById('admin-login-form')?.classList.toggle('hidden', isAdmin);
  document.getElementById('admin-controls')?.classList.toggle('hidden', !isAdmin);
  document.getElementById('admin-commissions-section')?.classList.toggle('hidden', !isAdmin);
  document.getElementById('admin-payments-section')?.classList.toggle('hidden', !isAdmin);
  
  if (user) {
    const userEmailEl = document.getElementById('admin-user-email');
    if (userEmailEl) userEmailEl.textContent = user.email;
  }
  renderProducts();
});

// Real-time Products Snapshot
onSnapshot(collection(db, "products"), (snapshot) => {
  currentProducts = [];
  snapshot.forEach((docSnapshot) => {
    currentProducts.push({ id: docSnapshot.id, ...docSnapshot.data() });
  });
  renderProducts();
});

// Real-time Commissions Snapshot (Admin)
onSnapshot(collection(db, "commissions"), (snapshot) => {
  const commList = document.getElementById('commission-list');
  if (!commList) return;
  commList.innerHTML = '';

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const card = document.createElement('div');
    card.style.cssText = "padding: 10px; border-bottom: 1px solid var(--border); margin-bottom: 8px;";
    card.innerHTML = `
      <h4>${data.name || 'Neznámý'} (${data.email || 'Bez e-mailu'})</h4>
      <p><strong>Rozpočet:</strong> ${data.estimatedPriceCZK || 0} Kč</p>
      <p>${data.description || ''}</p>
      <div style="margin-top: 5px;">
        <button class="delete-comm-btn danger-btn" data-id="${docSnap.id}">Smazat poptávku</button>
      </div>
    `;
    commList.appendChild(card);
  });

  document.querySelectorAll('.delete-comm-btn').forEach(btn => {
    btn.onclick = (e) => {
      const docId = e.target.getAttribute('data-id');
      deleteDoc(doc(db, "commissions", docId));
    };
  });
});

// Real-time Payment History Snapshot (Admin)
const paymentsQuery = query(collection(db, "payments"), orderBy("timestamp", "desc"));
onSnapshot(paymentsQuery, (snapshot) => {
  const historyList = document.getElementById('payment-history-list');
  if (!historyList) return;
  historyList.innerHTML = '';

  if (snapshot.empty) {
    historyList.innerHTML = '<p style="color: var(--text-muted);">Zatím žádná historie plateb.</p>';
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const formattedDate = data.timestamp?.toDate 
      ? data.timestamp.toDate().toLocaleString('cs-CZ') 
      : new Date().toLocaleString('cs-CZ');

    const row = document.createElement('div');
    row.style.cssText = "padding: 8px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;";
    row.innerHTML = `
      <div>
        <strong>${data.productTitle || 'Neznámý produkt'}</strong> - ${data.price || 0} Kč<br>
        <small style="color: var(--text-muted);">Datum: ${formattedDate} | Status: ${data.status || 'Zahájeno'}</small>
      </div>
      <button class="delete-payment-btn danger-btn" data-id="${docSnap.id}">Smazat</button>
    `;
    historyList.appendChild(row);
  });

  document.querySelectorAll('.delete-payment-btn').forEach(btn => {
    btn.onclick = (e) => {
      const docId = e.target.getAttribute('data-id');
      deleteDoc(doc(db, "payments", docId));
    };
  });
});

// Render Products (No Images + Search/Filters + Admin Actions)
function renderProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  productList.innerHTML = '';
  const texts = i18n[currentLang];

  // Filter products based on search term & sold status
  const filteredProducts = currentProducts.filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSold = hideSold ? !item.isSold : true;
    return matchesSearch && matchesSold;
  });

  filteredProducts.forEach((item) => {
    const numericPrice = Number(item.price) || 0;
    const card = document.createElement('div');
    card.className = 'product-card';

    let adminControlsHTML = '';
    if (isAdmin) {
      adminControlsHTML = `
        <div class="admin-edit" style="margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap;">
            <input type="number" id="input-${item.id}" value="${numericPrice}" style="width: 80px;" />
            <button class="update-btn" data-id="${item.id}">${texts.updatePrice}</button>
            <button class="toggle-sold-btn danger-btn" data-id="${item.id}" data-sold="${item.isSold || false}">${texts.toggleSold}</button>
            <button class="delete-product-btn danger-btn" data-id="${item.id}">${texts.deleteItem}</button>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="product-title">
        ${item.title || 'Untitled'}
        ${item.isSold ? `<span class="sold-badge">${texts.sold}</span>` : ''}
      </div>
      <div class="product-desc">${item.description || ''}</div>
      <div class="product-price">${numericPrice} ${texts.currencySymbol}</div>
      <button class="buy-btn" data-id="${item.id}" ${item.isSold ? 'disabled style="opacity:0.5;"' : ''}>${item.isSold ? texts.sold : texts.buyNow}</button>
      ${adminControlsHTML}
    `;

    productList.appendChild(card);
  });

  // Attach Stripe Redirect Handlers
  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.preventDefault();
      const docId = btn.getAttribute('data-id');
      const product = currentProducts.find(p => p.id === docId);

      if (!product) return alert('Produkt nebyl nalezen.');

      const url = product.stripeURL || product.stripeUrl || product.paymentLink;
      if (!url) return alert(`Chybí Stripe URL pro "${product.title}". Zkontrolujte pole stripeURL v databázi.`);

      try {
        await addDoc(collection(db, "payments"), {
          productId: product.id,
          productTitle: product.title || 'Untitled',
          price: product.price || 0,
          stripeURL: url.trim(),
          timestamp: new Date(),
          status: 'Zahájeno (Redirect)'
        });
      } catch (err) {
        console.error("Chyba zápisu do historie:", err);
      }

      window.location.href = url.trim();
    };
  });

  // Admin Controls Listeners
  if (isAdmin) {
    document.querySelectorAll('.update-btn').forEach(btn => {
      btn.onclick = (e) => {
        const docId = btn.getAttribute('data-id');
        const newPrice = Number(document.getElementById(`input-${docId}`).value);
        updateDoc(doc(db, "products", docId), { price: newPrice });
      };
    });

    document.querySelectorAll('.toggle-sold-btn').forEach(btn => {
      btn.onclick = (e) => {
        const docId = btn.getAttribute('data-id');
        const currentSold = btn.getAttribute('data-sold') === 'true';
        updateDoc(doc(db, "products", docId), { isSold: !currentSold });
      };
    });

    document.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.onclick = (e) => {
        const docId = btn.getAttribute('data-id');
        if (confirm('Opravdu chcete tento produkt smazat?')) {
          deleteDoc(doc(db, "products", docId));
        }
      };
    });
  }
}

// Add Product Handler (No Image Upload)
const addProductBtn = document.getElementById('add-product-btn');
if (addProductBtn) {
  addProductBtn.onclick = async () => {
    const title = document.getElementById('new-title').value;
    const description = document.getElementById('new-desc').value;
    const price = Number(document.getElementById('new-price').value);
    const stripeURL = document.getElementById('new-stripe-url')?.value || '';

    if (!title || !price) {
      alert('Vyplňte název a cenu');
      return;
    }

    await addDoc(collection(db, "products"), {
      title, 
      description, 
      price, 
      stripeURL: stripeURL.trim(), 
      isSold: false
    });

    alert('Produkt úspěšně vytvořen!');
    document.getElementById('new-title').value = '';
    document.getElementById('new-desc').value = '';
    document.getElementById('new-price').value = '';
    if (document.getElementById('new-stripe-url')) document.getElementById('new-stripe-url').value = '';
  };
}

// Commission Form Handler
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
