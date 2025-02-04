let array = [];
function fetchData(){
  showLoading()
  fetch("/data")
    .then(res => res.json())
    .then(data => {
      loadData(data);
      stopLoading();
    })
    .catch(err =>{
      stopLoading();
      alert("Error Failed To Fetch");
    });
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
function loadData(data){
  array = data;
  displayNames();
}
function save(){
  showLoading();
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
      alert("Error While Saving")
    })
}
function showLoading(){
  document.querySelector(".loader").style.display = "flex";
}
function stopLoading(){
  document.querySelector(".loader").style.display = "none";
}
function displayNames(){
  document.querySelector(".displayNames").innerHTML = "";
  array.forEach((item, index) =>{
    let div = document.createElement("div");
    div.className = "list";
    div.innerHTML = `
      <div class="name" onclick="openSecond(${index})">${item.name}</div>
      <input type="text" style="display:none;" id="newName" class="newNameInput">
      <div class="buttons">
        <button class="editBtn"><i class="fas fa-edit"></i></button>
        <button class="removeBtn" onclick="removeName(${index})"><i class="fas fa-trash"></i></button>
        <button class="saveBtn" onclick="saveEdit(${index})" style="display:none;"><i class="fas fa-save"></i></button>
        <button class="cancelBtn" style="display:none;"><i class="fas fa-cancel"></i></button>
    `;
    document.querySelector(".displayNames").appendChild(div);
    setupEditHandlers(div, index);
  });
}
function openSecond(id){
  window.location.href = `/deals/${id + 1}`;
}
function setupEditHandlers(div, index){
  let editingData = array[index];
  let editBtn = div.querySelector(".editBtn");
  let removeBtn = div.querySelector(".removeBtn");
  let name = div.querySelector(".name");
  let saveBtn = div.querySelector(".saveBtn");
  let cancelBtn = div.querySelector(".cancelBtn");
  let newNameInput = div.querySelector(".newNameInput");
  editBtn.onclick = () => {
  name.style.display = "none";
  editBtn.style.display = "none";
  removeBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
  cancelBtn.style.display = "inline-block";
  newNameInput.style.display = "inline-block";
  newNameInput.value = editingData.name;
  };
  saveBtn.onclick = () => {
    let newName = newNameInput.value.trim();
    let addedData = array.find(i=> i.name == newName);
    if (newName && !addedData) {
      array[index].name = newNameInput.value.trim();
    name.style.display = "inline-block";
  editBtn.style.display = "inline-block";
  removeBtn.style.display = "inline-block";
  saveBtn.style.display = "none";
  cancelBtn.style.display = "none";
  newNameInput.style.display = "none";
  newNameInput.value = editingData.name;
  save();
    }
    else if(addedData){
      alert("এই নামটি এর আগেও যোগ করা হয়েছে!");
    }else{
      alert("শুন্য নাম সেট করা যাবে না");
    }
  };
  cancelBtn.onclick = () =>{
    name.style.display = "inline-block";
  editBtn.style.display = "inline-block";
  removeBtn.style.display = "inline-block";
  saveBtn.style.display = "none";
  cancelBtn.style.display = "none";
  newNameInput.style.display = "none";
  };
}
function removeName(index){
  confirm("আপনি কি এই নামটি মুছে ফেলার বিষয়ে নিশ্চিত?", function(){
    array.splice(index, 1);
    save();
  });
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
function addName(){
  let name = document.getElementById("entryName").value.trim();
  let addedData = array.find(i => i.name == name);
  let lastModified = getCurrentDate();
  if(name && !addedData){
    array.push({ name, lastModified, deals: [] });
    document.getElementById("entryName").value = "";
    save();
  }else if(addedData){
    alert("এই নামটি এর আগেও যোগ করা হয়েছে!");
  }else{
    alert("শুন্য নাম সেট করা যাবে না");
  }
}
fetchData();