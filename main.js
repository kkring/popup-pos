// main.js
import { db } from "./firebase-config.js";
import {
  ref,
  onValue,
  update,
  get
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const productRef = ref(db, "products");

let products = [];
let cart = {};

const menuEl = document.getElementById("menu");
const receiptEl = document.getElementById("receipt");
const totalEl = document.getElementById("total");
const confirmBtn = document.getElementById("confirm");
const clearItemBtn = document.getElementById("clear-item");
const logBtn = document.getElementById("sales-log");

const bundleMap = {
  "티머그 세트 - 오리엔탈 (티백)": { "티머그": 1, "쇼핑백": 1 },
  "티머그 세트 - 스윗 (티백)": { "티머그": 1, "쇼핑백": 1 },
  "티머그 세트 - 쿨 (티백)": { "티머그": 1, "쇼핑백": 1 }
};

onValue(productRef, (snapshot) => {
  const data = snapshot.val();
  products = Object.entries(data).map(([id, value]) => ({ id, ...value }));
  renderMenu();
  renderReceipt();
});

function renderMenu() {
  menuEl.innerHTML = "";
  products.forEach((p) => {
    const item = document.createElement("div");
    item.className = "menu-item";
    const sold = p.initialStock !== undefined ? p.initialStock - p.stock : "?";
    item.innerHTML = `
      ${p.name}<br>
      ₩${p.price.toLocaleString()}<br>
      <small>재고: ${p.stock} (판매: ${sold})</small>
    `;

    item.onclick = () => {
      if (!cart[p.name]) cart[p.name] = { qty: 0, price: p.price, id: p.id };
      cart[p.name].qty++;
      renderReceipt();
    };

    menuEl.appendChild(item);
  });
}

function renderReceipt() {
  receiptEl.innerHTML = "";
  let total = 0;

  Object.entries(cart).forEach(([name, { qty, price }]) => {
    const product = products.find(p => p.name === name);
    const item = document.createElement("div");
    item.className = "receipt-item";

    const infoWrap = document.createElement("div");

    const nameEl = document.createElement("span");
    nameEl.textContent = name;

    const qtyControl = document.createElement("div");
    qtyControl.style.display = "flex";
    qtyControl.style.alignItems = "center";
    qtyControl.style.gap = "0.25rem";

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "−";
    minusBtn.onclick = () => {
      cart[name].qty--;
      renderReceipt();
    };

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.value = qty;
    qtyInput.style.width = "60px";
    qtyInput.onchange = () => {
      const newQty = parseInt(qtyInput.value);
      if (!isNaN(newQty)) {
        cart[name].qty = newQty;
        renderReceipt();
      }
    };

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "＋";
    plusBtn.onclick = () => {
      cart[name].qty++;
      renderReceipt();
    };

    qtyControl.appendChild(minusBtn);
    qtyControl.appendChild(qtyInput);
    qtyControl.appendChild(plusBtn);

    const priceEl = document.createElement("span");
    priceEl.textContent = `₩${(qty * price).toLocaleString()}`;

    infoWrap.appendChild(nameEl);
    infoWrap.appendChild(qtyControl);
    infoWrap.appendChild(priceEl);

    const btnWrap = document.createElement("div");
    btnWrap.className = "btn-wrap";

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑";
    delBtn.onclick = () => {
      delete cart[name];
      renderReceipt();
    };

    btnWrap.appendChild(delBtn);
    item.appendChild(infoWrap);
    item.appendChild(btnWrap);
    receiptEl.appendChild(item);

    total += qty * price;
  });

  totalEl.textContent = total.toLocaleString();
}

confirmBtn.onclick = async () => {
  const updates = {};
  const latestSnapshot = await get(productRef);
  const latestProducts = latestSnapshot.val();

  for (const [name, { qty, id }] of Object.entries(cart)) {
    const latestStock = latestProducts[id].stock;
    updates[`/products/${id}/stock`] = latestStock - qty;

    const subItems = bundleMap[name];
    if (subItems) {
      for (const [subName, subQty] of Object.entries(subItems)) {
        const subProduct = products.find(p => p.name === subName);
        if (subProduct) {
          const subStock = latestProducts[subProduct.id].stock;
          updates[`/products/${subProduct.id}/stock`] = subStock - (qty * subQty);
        }
      }
    }
  }

  await update(ref(db), updates);

  alert("✅ 결제가 완료되었습니다.");
  cart = {};
  renderReceipt();
};

clearItemBtn.onclick = () => {
  const name = prompt("삭제할 항목명을 정확히 입력하세요:");
  if (name in cart) {
    delete cart[name];
    renderReceipt();
  } else {
    alert("해당 항목이 장바구니에 없습니다.");
  }
};

logBtn.onclick = () => {
  alert("※ 이 버전은 매출 기록 없이 재고만 실시간 공유합니다.");
};
