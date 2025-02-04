let array = [];
let dealsArray = [];
let id = window.location.pathname.split("/").pop();
function fetchData(){
  showLoading();
  fetch("/data")
    .then(res => res.json())
    .then(data => {
      loadData(data);
      stopLoading();
    })
    .catch(err =>{
      console.log("Error: ", err);
    });
}
fetchData();
function loadData(data){
  array = data;
  dealsArray = array[id - 1];
  displayDeals();
}
let count = 0, total = 0;
function addDeal(){
  let item = document.getElementById("itemName").value.trim();
  let price = parseFloat(document.getElementById("itemPrice").value.trim()) || 0;
  let itemAdded = dealsArray.deals.find(g => g.item == item);
  
  // let lastModified = `${day}/${month}/${year}, ${hour}:${minute} ${amPm}`;
  let lastModified = getCurrentDate();
  if(item && !itemAdded && lastModified){
    dealsArray.deals.push({ item, price });
    dealsArray.lastModified = lastModified;
    save();
    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
  }
  else if(itemAdded){
      alert("এই আইটেমটি এর আগেও যোগ করা হয়েছে!");
    }else{
      alert("সেই আইটেমটি সেট করা যাবে না");
    }
}
function getCurrentDate(){
  let date = new Date();
  let day = date.getDate().toString().padStart(2, "0");
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let year = date.getFullYear();
  let hour = (date.getHours() % 12 || 12).toString().padStart(2, "0");
  let minute = date.getMinutes().toString().padStart(2, "0");
  let amPm = date.getHours() >= 12 ? "wc Gg" : "G Gg";
  return `${day}/${month}/${year}, ${hour}:${minute} ${amPm}`;
}
function editDeal(index){
  scroll(0, function(){
    document.getElementById("itemName").focus();
  });
  document.getElementById("itemName").value = dealsArray.deals[0].item;
  document.getElementById("itemPrice").value = dealsArray.deals[0].price;
  document.querySelector(".cancelBtn").style.display = "inline-block";
  document.querySelector(".addBtn").innerText = "সংরক্ষন করুন";
  document.querySelector(".addBtn").onclick = () => {
    saveEdit();
  };
  function saveEdit(){
    let item = document.getElementById("itemName").value.trim();
  let price = parseFloat(document.getElementById("itemPrice").value.trim()) || 0;
  let itemAdded = dealsArray.deals.find(g => g.item == item);
  let lastModified = getCurrentDate();
  if(item && lastModified){
    dealsArray.deals[index] = {
      item: item,
      price: price
    };
    dealsArray.lastModified = lastModified;
    save();
    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
  }
  else{
      alert("সেই আইটেমটি সেট করা যাবে না");
    }
    
  }
}
function scroll(pos, callback){
  window.scrollTo({
    top: pos,
    behavior: "smooth"
  });
  let intervalId = setInterval(function() {
    if(window.scrollY == pos){
      clearInterval(intervalId);
      callback();
    }
  }, 10);
}
function removeDeal(index){
  confirm("আপনি কি এই নামটি মুছে ফেলার বিষয়ে নিশ্চিত?", function(){
    dealsArray.deals.splice(index, 1);
    save();
  });
}
function cancelEdit(){
  document.querySelector(".cancelBtn").style.display = "none";
  document.querySelector(".addBtn").innerText = "যোগ করুন";
  document.querySelector(".addBtn").onclick = () => {
    addDeal();
  };
  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
}
function displayDeals(){
  document.getElementById("displayDeals").innerHTML = "";
  count = 0, total = 0;
  dealsArray.deals.forEach((item, index)=>{
    count++;
    total += item.price;
    let tr = document.createElement("tr");
    tr.innerHTML = `
        <th>
        <div class="count">${count}</div>
        </th>
        <td>${item.item}</td>
        <td>
        <div class="price">${item.price}/=</div>
        </td>
        <td>
          <div class="wrapper">
            <button onclick="editDeal(${index})">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="removeDeal(${index})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
    `;
    document.getElementById("displayDeals").appendChild(tr);
  });
  document.getElementById("total").innerText = `${total}/=`;
  document.getElementById("currentName").innerText = `${dealsArray.name}`;
  document.getElementById("lastModified").innerText = `me©‡kl ms‡kvwaZ ZvwiL: ${dealsArray.lastModified}`;
}
function save(){
  fetch("/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(array)
  })
  .then(res => res.json())
  .then(response => {
    fetchData();
  })
  .catch(err =>{
    stopLoading();
    alert(err);
  });
}
function showLoading(){
  document.querySelector(".loader").style.display = "flex";
}
function stopLoading(){
  document.querySelector(".loader").style.display = "none";
}
function alert(msg){
  document.querySelector(".alertMsg").innerText = msg;
  document.querySelector(".alert").classList.add("open");
  document.querySelector(".overlay").classList.add("open");
  document.querySelector("body").classList.add("noScroll");
  document.getElementById("ok").onclick = () => {
  document.querySelector(".alert").classList.remove("open");
  document.querySelector(".overlay").classList.remove("open");
  document.querySelector("body").classList.remove("noScroll");
  };
  document.querySelector(".overlay").onclick = ()=>{
  document.querySelector(".alert").classList.remove("open");
  document.querySelector(".overlay").classList.remove("open");
  document.querySelector("body").classList.remove("noScroll");
  };
}
function confirm(msg, callback){
  document.querySelector(".confirmMsg").innerText = msg;
  document.querySelector(".confirm").classList.add("open");
  document.querySelector(".overlay").classList.add("open");
  document.querySelector("body").classList.add("noScroll");
  document.getElementById("no").onclick = ()=>{
  document.querySelector(".confirm").classList.remove("open");
  document.querySelector(".overlay").classList.remove("open");
  document.querySelector("body").classList.remove("noScroll");
  };
  document.querySelector(".overlay").onclick = ()=>{
  document.querySelector(".confirm").classList.remove("open");
  document.querySelector(".overlay").classList.remove("open");
  document.querySelector("body").classList.remove("noScroll");
  };
  document.getElementById("yes").onclick = ()=>{
  callback();
  document.querySelector(".confirm").classList.remove("open");
  document.querySelector(".overlay").classList.remove("open");
  document.querySelector("body").classList.remove("noScroll");
  };
}