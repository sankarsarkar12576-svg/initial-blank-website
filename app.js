const API = "https://script.google.com/macros/s/AKfycbzE18aCZ6oWic_CPGLvIgWWKwIzbVOt_FuerNBS0kyIYDR-XLRSTK-R9vMNvO4YAoIz/exec";

// 🔥 DRAWER
function toggleMenu(){
let drawer = document.getElementById("drawer");
let overlay = document.getElementById("overlay");

drawer.classList.toggle("active");
overlay.style.display = drawer.classList.contains("active") ? "block" : "none";
}

// 🔗 NAV
function go(page){
window.location.href = page;
}

// 🔥 PAGE SWITCH
function showPage(page){

["home","menuPage","tablePage","orderPage","sellPage"].forEach(id=>{
let el = document.getElementById(id);
if(el) el.style.display="none";
});

if(page=="home") document.getElementById("home").style.display="block";
if(page=="menu") document.getElementById("menuPage").style.display="block";
if(page=="table") document.getElementById("tablePage").style.display="block";
if(page=="order") document.getElementById("orderPage").style.display="block";
if(page=="sell") document.getElementById("sellPage").style.display="block";

toggleMenu();
}

// ================= MENU ADMIN =================

function addMenu(){

let name = document.getElementById("name").value;
let price = document.getElementById("price").value;
let file = document.getElementById("img").files[0];

if(!name || !price || !file){
alert("সব fill করো");
return;
}

let reader = new FileReader();

reader.onload = function(e){

fetch(API,{
method:"POST",
body:JSON.stringify({
action:"addMenu",
name:name,
price:price,
image:e.target.result
})
})
.then(()=>{
alert("✅ Item Added");
loadMenuAdmin();
});

};

reader.readAsDataURL(file);
}

function loadMenuAdmin(){

fetch(API+"?action=getMenu")
.then(res=>res.json())
.then(data=>{

let html="";

data.forEach(i=>{
html+=`
<div class="card">
<img src="${i.image}" width="80">
<b>${i.name}</b> - ₹${i.price}
<button onclick="deleteMenu(${i.id})">❌ Delete</button>
</div>`;
});

document.getElementById("menuList").innerHTML = html;

});
}

function deleteMenu(id){

fetch(API,{
method:"POST",
body:JSON.stringify({action:"deleteMenu",id:id})
})
.then(()=>loadMenuAdmin());
}

// ================= TABLE =================

function addTable(){

let tno = document.getElementById("tno").value;
let chairs = document.getElementById("chairs").value;

fetch(API,{
method:"POST",
body:JSON.stringify({
action:"addTable",
tableNumber:tno,
chairs:chairs
})
})
.then(()=>{
alert("Table Added");
loadTablesAdmin();
});
}

function loadTablesAdmin(){

fetch(API+"?action=getTables")
.then(r=>r.json())
.then(tables=>{

fetch(API+"?action=getOrders")
.then(r=>r.json())
.then(orders=>{

let html="";

tables.forEach(t=>{
let active = orders.find(o=>o.table == t.tableNumber && o.status!="DONE");

html+=`
<div class="tableBox ${active ? 'green':'white'}"
onclick="openTable('${t.tableNumber}')">
Table ${t.tableNumber}
</div>`;
});

document.getElementById("tables").innerHTML=html;

});
});
}

// ================= MENU USER =================

function loadMenu(){

let menu = document.getElementById("menu");
menu.innerHTML = "<h3>Loading...</h3>";

fetch(API+"?action=getMenu")
.then(r=>r.json())
.then(data=>{

let html="";
data.forEach(i=>{
html+=`
<div class="card">
<img src="${i.image}">
<h4>${i.name}</h4>
<p>₹${i.price}</p>
<button onclick="add('${i.name}',${i.price},this)">Add</button>
</div>`;
});

menu.innerHTML = html;

});
}

// ================= CART =================

function add(name,price,btn){

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let f = cart.find(i=>i.name==name);

if(f) f.qty++;
else cart.push({name,price,qty:1});

localStorage.setItem("cart",JSON.stringify(cart));

btn.innerText="✔ Added";
setTimeout(()=>btn.innerText="Add",800);
}

function loadCart(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let html="";
let total=0;

cart.forEach((i,index)=>{
total += i.price*i.qty;

html+=`
<div class="card">
${i.name} x${i.qty}
<button onclick="inc(${index})">+</button>
<button onclick="dec(${index})">-</button>
<button onclick="removeCartItem(${index})">❌</button>
</div>`;
});

html += `<h3>Total ₹${total}</h3>`;
document.getElementById("cartItems").innerHTML = html;
}

function inc(i){
let cart=JSON.parse(localStorage.getItem("cart"));
cart[i].qty++;
localStorage.setItem("cart",JSON.stringify(cart));
loadCart();
}

function dec(i){
let cart=JSON.parse(localStorage.getItem("cart"));
if(cart[i].qty>1) cart[i].qty--;
localStorage.setItem("cart",JSON.stringify(cart));
loadCart();
}

function removeCartItem(i){
let cart=JSON.parse(localStorage.getItem("cart"));
cart.splice(i,1);
localStorage.setItem("cart",JSON.stringify(cart));
loadCart();
}

// ================= TABLE DROPDOWN =================

function loadTables(){

fetch(API+"?action=getTables")
.then(r=>r.json())
.then(data=>{

let html="";
data.forEach(t=>{
html += `<option>${t.tableNumber}</option>`;
});

document.getElementById("table").innerHTML = html;

});
}

// ================= ORDER =================

function placeOrder(){

let cname = document.getElementById("cname").value;
let phone = document.getElementById("phone").value;
let table = document.getElementById("table").value;

let cart=JSON.parse(localStorage.getItem("cart"))||[];
let total=0;

cart.forEach(i=>total+=i.price*i.qty);

fetch(API,{
method:"POST",
body:JSON.stringify({
action:"addOrder",
name:cname,
phone:phone,
table:table,
items:JSON.stringify(cart),
total:total,
status:"PENDING",
date:new Date().toLocaleDateString()
})
})
.then(()=>{
localStorage.removeItem("cart");
alert("✅ Order Placed");
window.location.href="order.html";
});
}

// ================= CUSTOMER ORDER =================

function loadOrder(){

let phone = document.getElementById("phone").value;
if(!phone) return;

fetch(API+"?action=getOrders")
.then(r=>r.json())
.then(data=>{

let html="";

data.forEach(o=>{
if(o.phone == phone){
html+=`
<div class="card">
Table: ${o.table}<br>
Total: ₹${o.total}<br>
Status: <b>${o.status}</b>
</div>`;
}
});

document.getElementById("orderList").innerHTML = html;

});
}

// ================= ADMIN ORDER =================

function loadOrdersAdmin(){

fetch(API+"?action=getOrders")
.then(r=>r.json())
.then(data=>{

let html="";

data.forEach(o=>{
html+=`
<div class="card">
Table: ${o.table}<br>
Total: ₹${o.total}<br>
Status: ${o.status}<br>

<button onclick="updateStatus(${o.id},'ACCEPTED')">Accept</button>
<button onclick="updateStatus(${o.id},'COOKING')">Cooking</button>
<button onclick="updateStatus(${o.id},'READY')">Ready</button>
</div>`;
});

document.getElementById("orders").innerHTML = html;

});
}

function updateStatus(id,status){

fetch(API,{
method:"POST",
body:JSON.stringify({
action:"updateStatus",
id:id,
status:status
})
})
.then(()=>loadOrdersAdmin());
}

// ================= BILL =================

function openTable(tableNo){

fetch(API+"?action=getOrders")
.then(r=>r.json())
.then(data=>{

let text="Table "+tableNo+"\n\n";
let total=0;

data.forEach(o=>{
if(o.table == tableNo){

let items = JSON.parse(o.items);

items.forEach(i=>{
text += i.name+" x"+i.qty+" = ₹"+(i.price*i.qty)+"\n";
total += i.price*i.qty;
});

}
});

text += "\nTotal: ₹"+total;

let win = window.open('', '', 'width=300,height=400');
win.document.write("<pre>"+text+"</pre>");
win.print();

});
}
if(window.location.href.includes("admin")){

loadTablesAdmin();

setInterval(()=>{
loadTablesAdmin();
},5000);

}