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

// Multilingual Dictionary
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
    adminManagement: "Admin Správa",
    logout: "Odhlásit se",
    loggedInAs: "Přihlášen jako:",
    addNewProduct: "Přidat nový produkt",
    newTitlePlaceholder: "Název produktu",
    newDescPlaceholder: "Popis produktu",
    newPricePlaceholder: "Cena (CZK)",
    saveProduct: "Uložit produkt",
    buyNow: "Koupit nyní",
    updatePrice: "Upravit cenu",
    deleteItem: "Smazat",
    currencySymbol: "Kč",
    sold: "PRODÁNO",
    toggleSold: "Změnit stav prodáno",
    searchPlaceholder: "Hledat dílo...",
    filterHideSold: "Skrýt prodané",
    sortNewest: "Nejnovější",
    sortPriceAsc: "Cena: Od nejlevnějšího",
    sortPriceDesc: "Cena: Od nejdražšího",
    statusPending: "Čeká",
    statusInProgress: "V řešení",
    statusCompleted: "Dokončeno",
    commissionRequests: "Poptávky zakázkové tvorby",
    paymentHistory: "Historie plateb",
    adminEmailPlaceholder: "Admin Email",
    adminPasswordPlaceholder: "Heslo",
    statTotalProducts: "Produktů",
    statPendingCommissions: "Poptávek",
    statTotalRevenue: "Příjmy z logů",
    confirmDelete: "Opravdu chcete tuto položku smazat?",
    productAdded: "Produkt úspěšně vytvořen!",
    commissionSubmitted: "Poptávka byla úspěšně odeslána!",
    fillAllFields: "Vyplňte prosím všechna povinná pole"
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
    adminManagement: "Admin Management",
    logout: "Log Out",
    loggedInAs: "Logged in as:",
    addNewProduct: "Add New Product",
    newTitlePlaceholder: "Product Title",
    newDescPlaceholder: "Product Description",
    newPricePlaceholder: "Price (CZK)",
    saveProduct: "Save Product",
    buyNow: "Buy Now",
    updatePrice: "Update Price",
    deleteItem: "Delete",
    currencySymbol: "CZK",
    sold: "SOLD OUT",
    toggleSold: "Toggle Sold Status",
    searchPlaceholder: "Search artwork...",
    filterHideSold: "Hide sold items",
    sortNewest: "Newest First",
    sortPriceAsc: "Price: Low to High",
    sortPriceDesc: "Price: High to Low",
    statusPending: "Pending",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    commissionRequests: "Commission Requests",
    paymentHistory: "Payment History",
    adminEmailPlaceholder: "Admin Email",
    adminPasswordPlaceholder: "Password",
    statTotalProducts: "Products",
    statPendingCommissions: "Requests",
    statTotalRevenue: "Log Revenue",
    confirmDelete: "Are you sure you want to delete this item?",
    productAdded: "Product created successfully!",
    commissionSubmitted: "Commission request submitted successfully!",
    fillAllFields: "Please fill in all required fields"
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
    adminManagement: "Admin-Verwaltung",
    logout: "Abmelden",
    loggedInAs: "Angemeldet als:",
    addNewProduct: "Neues Produkt hinzufügen",
    newTitlePlaceholder: "Produktname",
    newDescPlaceholder: "Produktbeschreibung",
    newPricePlaceholder: "Preis (CZK)",
    saveProduct: "Produkt Speichern",
    buyNow: "Jetzt Kaufen",
    updatePrice: "Preis Ändern",
    deleteItem: "Löschen",
    currencySymbol: "CZK",
    sold: "VERKAUFT",
    toggleSold: "Status ändern",
    searchPlaceholder: "Kunstwerk suchen...",
    filterHideSold: "Verkaufte ausblenden",
    sortNewest: "Neueste zuerst",
    sortPriceAsc: "Preis: Aufsteigend",
    sortPriceDesc: "Preis: Absteigend",
    statusPending: "Ausstehend",
    statusInProgress: "In Bearbeitung",
    statusCompleted: "Abgeschlossen",
    commissionRequests: "Auftragsanfragen",
    paymentHistory: "Zahlungsverlauf",
    adminEmailPlaceholder: "Admin-E-Mail",
    adminPasswordPlaceholder: "Passwort",
    statTotalProducts: "Produkte",
    statPendingCommissions: "Anfragen",
    statTotalRevenue: "Einnahmen",
    confirmDelete: "Möchten Sie diesen Eintrag wirklich löschen?",
    productAdded: "Produkt erfolgreich erstellt!",
    commissionSubmitted: "Anfrage erfolgreich gesendet!",
    fillAllFields: "Bitte füllen Sie alle Pflichtfelder aus"
  }
};

let currentLang = 'cz';
let isAdmin = false;
let currentProducts = [];
let currentCommissions = [];
let currentPayments = [];
let searchQuery = '';
let sortBy = 'newest';
let hideSold = false;

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Dark / Light Theme Engine
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    };
  }
}

// Language Engine
function updateLanguageUI() {
  const texts = i18n[currentLang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (texts[key]) el.textContent = texts[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (texts[key]) el.placeholder = texts[key];
  });

  const priceInput = document.getElementById('price');
  const priceOutput = document.getElementById('price-output');
  if (priceInput && priceOutput) {
    priceOutput.textContent = `${priceInput.value} ${texts.currencySymbol}`;
  }

  renderProducts();
  if (isAdmin) {
    renderCommissions();
    renderPayments();
  }
}

// Event Listeners
document.getElementById('lang-select')?.addEventListener('change', (e) => {
  currentLang = e.target.value;
  updateLanguageUI();
});

document.getElementById('search-input')?.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderProducts();
});

document.getElementById('sort-select')?.addEventListener('change', (e) => {
  sortBy = e.target.value;
  renderProducts();
});

document.getElementById('hide-sold-checkbox')?.addEventListener('change', (e) => {
  hideSold = e.target.checked;
  renderProducts();
});

const priceInputEl = document.getElementById('price');
if (priceInputEl) {
  priceInputEl.oninput = (e) => {
    document.getElementById('price-output').textContent = `${e.target.value} ${i18n[currentLang].currencySymbol}`;
  };
}

// Auth State Toggle Visibility Fix
onAuthStateChanged(auth, (user) => {
  isAdmin = !!user;

  document.getElementById('admin-login-form')?.classList.toggle('hidden', isAdmin);
  document.getElementById('admin-controls')?.classList.toggle('hidden', !isAdmin);
  document.getElementById('admin-commissions-section')?.classList.toggle('hidden', !isAdmin);
  document.getElementById('admin-payments-section')?.classList.toggle('hidden', !isAdmin);
  document.getElementById('admin-stats')?.classList.toggle('hidden', !isAdmin);

  if (user) {
    document.getElementById('admin-user-email').textContent = user.email;
    renderCommissions();
    renderPayments();
  } else {
    currentCommissions = [];
    currentPayments = [];
  }

  renderProducts();
  updateStats();
});

// Real-time Firestore Listeners
onSnapshot(collection(db, "products"), (snapshot) => {
  currentProducts = [];
  snapshot.forEach((docSnapshot) => {
    currentProducts.push({ id: docSnapshot.id, ...docSnapshot.data() });
  });
  renderProducts();
  updateStats();
});

onSnapshot(collection(db, "commissions"), (snapshot) => {
  if (!isAdmin) return;
  currentCommissions = [];
  snapshot.forEach((docSnap) => {
    currentCommissions.push({ id: docSnap.id, ...docSnap.data() });
  });
  renderCommissions();
  updateStats();
});

const paymentsQuery = query(collection(db, "payments"), orderBy("timestamp", "desc"));
onSnapshot(paymentsQuery, (snapshot) => {
  if (!isAdmin) return;
  currentPayments = [];
  snapshot.forEach((docSnap) => {
    currentPayments.push({ id: docSnap.id, ...docSnap.data() });
  });
  renderPayments();
  updateStats();
});

// Update Statistics
function updateStats() {
  if (!isAdmin) return;

  document.getElementById('stat-products').textContent = currentProducts.length;
  document.getElementById('stat-commissions').textContent = currentCommissions.length;
  
  const totalRev = currentPayments.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  document.getElementById('stat-revenue').textContent = `${totalRev} CZK`;
}

// Render Products
function renderProducts() {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  productList.innerHTML = '';
  const texts = i18n[currentLang];

  let filtered = currentProducts.filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSold = hideSold ? !item.isSold : true;
    return matchesSearch && matchesSold;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    return 0;
  });

  filtered.forEach((item) => {
    const numericPrice = Number(item.price) || 0;
    const card = document.createElement('div');
    card.className = 'product-card';

    let adminControlsHTML = '';
    if (isAdmin) {
      adminControlsHTML = `
        <div class="admin-edit" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
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
      <button class="buy-btn" data-id="${item.id}" ${item.isSold ? 'disabled style="opacity:0.5;"' : ''}>
        ${item.isSold ? texts.sold : texts.buyNow}
      </button>
      ${adminControlsHTML}
    `;

    productList.appendChild(card);
  });

  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.preventDefault();
      const docId = btn.getAttribute('data-id');
      const product = currentProducts.find(p => p.id === docId);

      if (!product) return showToast('Produkt nebyl nalezen.', 'error');

      const url = product.stripeURL || product.stripeUrl || product.paymentLink;
      if (!url) return showToast(`Chybí Stripe URL pro "${product.title}".`, 'error');

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

  if (isAdmin) {
    document.querySelectorAll('.update-btn').forEach(btn => {
      btn.onclick = (e) => {
        const docId = btn.getAttribute('data-id');
        const newPrice = Number(document.getElementById(`input-${docId}`).value);
        updateDoc(doc(db, "products", docId), { price: newPrice });
        showToast('Cena upravena');
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
        if (confirm(texts.confirmDelete)) {
          deleteDoc(doc(db, "products", docId));
          showToast('Produkt smazán', 'info');
        }
      };
    });
  }
}

// Render Commissions
function renderCommissions() {
  const commList = document.getElementById('commission-list');
  if (!commList || !isAdmin) return;
  commList.innerHTML = '';
  const texts = i18n[currentLang];

  currentCommissions.forEach((data) => {
    const status = data.status || 'pending';
    const card = document.createElement('div');
    card.style.cssText = "padding: 12px; border-bottom: 1px solid var(--border-color); margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px;";
    card.innerHTML = `
      <div style="display:flex; justify-content: space-between; align-items:center; gap: 10px; flex-wrap: wrap;">
        <h4>${data.name || 'Neznámý'} (${data.email || 'Bez e-mailu'})</h4>
        <select class="comm-status-select" data-id="${data.id}">
          <option value="pending" ${status === 'pending' ? 'selected' : ''}>${texts.statusPending}</option>
          <option value="in_progress" ${status === 'in_progress' ? 'selected' : ''}>${texts.statusInProgress}</option>
          <option value="completed" ${status === 'completed' ? 'selected' : ''}>${texts.statusCompleted}</option>
        </select>
      </div>
      <p><strong>Rozpočet:</strong> ${data.estimatedPriceCZK || 0} ${texts.currencySymbol}</p>
      <p>${data.description || ''}</p>
      <div>
        <button class="delete-comm-btn danger-btn" data-id="${data.id}">${texts.deleteItem}</button>
      </div>
    `;
    commList.appendChild(card);
  });

  document.querySelectorAll('.comm-status-select').forEach(sel => {
    sel.onchange = (e) => {
      const docId = e.target.getAttribute('data-id');
      updateDoc(doc(db, "commissions", docId), { status: e.target.value });
      showToast('Stav poptávky aktualizován');
    };
  });

  document.querySelectorAll('.delete-comm-btn').forEach(btn => {
    btn.onclick = (e) => {
      const docId = e.target.getAttribute('data-id');
      if (confirm(i18n[currentLang].confirmDelete)) {
        deleteDoc(doc(db, "commissions", docId));
        showToast('Poptávka smazána', 'info');
      }
    };
  });
}

// Render Payment History
function renderPayments() {
  const historyList = document.getElementById('payment-history-list');
  if (!historyList || !isAdmin) return;
  historyList.innerHTML = '';
  const texts = i18n[currentLang];

  if (currentPayments.length === 0) {
    historyList.innerHTML = `<p style="color: var(--text-muted);">Zatím žádná historie plateb.</p>`;
    return;
  }

  currentPayments.forEach((data) => {
    const formattedDate = data.timestamp?.toDate 
      ? data.timestamp.toDate().toLocaleString('cs-CZ') 
      : new Date().toLocaleString('cs-CZ');

    const row = document.createElement('div');
    row.style.cssText = "padding: 10px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 10px;";
    row.innerHTML = `
      <div>
        <strong>${data.productTitle || 'Neznámý produkt'}</strong> - ${data.price || 0} ${texts.currencySymbol}<br>
        <small style="color: var(--text-muted);">Datum: ${formattedDate} | Status: ${data.status || 'Zahájeno'}</small>
      </div>
      <button class="delete-payment-btn danger-btn" data-id="${data.id}">${texts.deleteItem}</button>
    `;
    historyList.appendChild(row);
  });

  document.querySelectorAll('.delete-payment-btn').forEach(btn => {
    btn.onclick = (e) => {
      const docId = btn.getAttribute('data-id');
      if (confirm(i18n[currentLang].confirmDelete)) {
        deleteDoc(doc(db, "payments", docId));
        showToast('Záznam smazán', 'info');
      }
    };
  });
}

// Add Product Event
document.getElementById('add-product-btn')?.addEventListener('click', async () => {
  const texts = i18n[currentLang];
  const title = document.getElementById('new-title').value;
  const description = document.getElementById('new-desc').value;
  const price = Number(document.getElementById('new-price').value);
  const stripeURL = document.getElementById('new-stripe-url')?.value || '';

  if (!title || !price) {
    showToast(texts.fillAllFields, 'error');
    return;
  }

  await addDoc(collection(db, "products"), {
    title, 
    description, 
    price, 
    stripeURL: stripeURL.trim(), 
    isSold: false
  });

  showToast(texts.productAdded, 'success');
  document.getElementById('new-title').value = '';
  document.getElementById('new-desc').value = '';
  document.getElementById('new-price').value = '';
  if (document.getElementById('new-stripe-url')) document.getElementById('new-stripe-url').value = '';
});

// Commission Form Submission
document.getElementById('commission-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const texts = i18n[currentLang];
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const description = document.getElementById('description').value;
  const estimatedPriceCZK = Number(document.getElementById('price').value);

  await addDoc(collection(db, "commissions"), {
    name, email, description, estimatedPriceCZK, status: 'pending', createdAt: new Date()
  });

  showToast(texts.commissionSubmitted, 'success');
  document.getElementById('commission-form').reset();
  document.getElementById('price-output').textContent = `100 ${texts.currencySymbol}`;
});

// Panel Toggle
document.getElementById('admin-toggle-btn')?.addEventListener('click', () => {
  document.getElementById('admin-panel')?.classList.toggle('hidden');
});

// Auth Click Handlers
document.getElementById('login-submit-btn')?.addEventListener('click', async () => {
  const email = document.getElementById('admin-email').value;
  const pass = document.getElementById('admin-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    showToast('Přihlášen jako admin', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  signOut(auth);
  showToast('Odhlášeno', 'info');
});

initTheme();
