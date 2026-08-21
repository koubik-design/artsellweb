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

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDy6Roy65lq7jQBmZAEjsOaAtjoi91mc5o",
  authDomain: "artbyfish.firebaseapp.com",
  projectId: "artbyfish",
  storageBucket: "artbyfish.firebasestorage.app",
  messagingSenderId: "300548114598",
  appId: "1:300548114598:web:caf025811635087d674c67",
  measurementId: "G-GE3YPXMPT3"
};

// Initialize Firebase & Analytics
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Initialize Stripe (Replace with your actual Stripe Publishable Key)
const stripeKey = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
let stripe;
if (window.Stripe) {
  stripe = Stripe(stripeKey);
}

const productList = document.getElementById('product-list');

// 1. Real-time Database Listener for Products
onSnapshot(collection(db, "products"), (snapshot) => {
  if (!productList) return;
  productList.innerHTML = '';
  
  snapshot.forEach((docSnapshot) => {
    const item = docSnapshot.data();
    const docId = docSnapshot.id;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-title">${item.title || 'Untitled Artwork'}</div>
      <div class="product-desc">${item.description || 'No description available.'}</div>
      <div class="product-price">$${item.price ?? 0}</div>
      <button class="buy-btn" data-stripe-id="${item.stripePriceId || ''}" style="margin-top: 10px;">Buy Now</button>
      
      <div class="admin-edit">
          <input type="number" id="input-${docId}" value="${item.price ?? 0}" />
          <button class="update-btn" data-id="${docId}">Update Price</button>
      </div>
    `;
    productList.appendChild(card);
  });

  // Attach event listeners to Buy buttons
  document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const stripePriceId = e.target.getAttribute('data-stripe-id');
      if (stripePriceId) {
        buyProduct(stripePriceId);
      } else {
        alert("This item does not have a Stripe Price ID linked in Firestore.");
      }
    });
  });

  // Attach event listeners to Price Update buttons
  document.querySelectorAll('.update-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      updatePrice(id);
    });
  });
});

// 2. Trigger Stripe Checkout via Firebase Extension
async function buyProduct(stripePriceId, userId = 'guest_user') {
  try {
    const sessionRef = await addDoc(collection(db, "customers", userId, "checkout_sessions"), {
      price: stripePriceId,
      mode: "payment",
      success_url: window.location.origin + "/success.html",
      cancel_url: window.location.origin + "/cancel.html",
    });

    onSnapshot(sessionRef, (snap) => {
      const data = snap.data();
      if (data?.error) alert(`Payment error: ${data.error.message}`);
      if (data?.url) window.location.assign(data.url);
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    alert("Could not create checkout session. Check your database permissions.");
  }
}

// 3. Update Product Price in Firestore
async function updatePrice(docId) {
  const inputEl = document.getElementById(`input-${docId}`);
  if (!inputEl) return;

  const newPrice = Number(inputEl.value);
  const productRef = doc(db, "products", docId);

  try {
    await updateDoc(productRef, { price: newPrice });
    alert("Price successfully updated in Firestore!");
  } catch (error) {
    console.error("Error updating price: ", error);
    alert("Failed to update price. Check your Firestore security rules.");
  }
}

// 4. Budget Slider Interactivity
const priceInput = document.getElementById('price');
const priceOutput = document.getElementById('price-output');

if (priceInput && priceOutput) {
  priceInput.addEventListener('input', (e) => {
    priceOutput.textContent = '$' + e.target.value;
    priceOutput.classList.add('pulse');
    setTimeout(() => priceOutput.classList.remove('pulse'), 150);
  });
}

// 5. Commission Request Form Submission
const commissionForm = document.getElementById('commission-form');
if (commissionForm) {
  commissionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const description = document.getElementById('description')?.value;
    const estimatedPrice = Number(document.getElementById('price')?.value);

    try {
      await addDoc(collection(db, "commissions"), {
        name,
        email,
        description,
        estimatedPrice,
        createdAt: new Date().toISOString()
      });
      alert('Commission request saved to database!');
      commissionForm.reset();
      if (priceOutput) priceOutput.textContent = '$250';
    } catch (error) {
      console.error("Error submitting commission:", error);
      alert("Failed to submit request.");
    }
  });
}
