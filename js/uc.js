

let UserCreds = JSON.parse(sessionStorage.getItem("user-creds"));
let UserInfo = JSON.parse(sessionStorage.getItem("user-info"));

let MsgHead = document.getElementById('msg');
let GreetHead = document.getElementById('greet');
let SignoutBtn = document.getElementById('signoutbutton');

let ActiveDeposit = document.getElementById('activedeposit');
let Profit = document.getElementById('profit');
let RealPlan = document.getElementById('realplan');
let TotalPropertiesOwned = document.getElementById('totalPropertiesOwned');
let TotalBalance = document.getElementById('totalbalance');

let Checkcred = () => {
  if (!sessionStorage.getItem("user-creds"))
    window.location.href = "index.html";
  else {
    MsgHead.innerText = UserCreds.email;
    GreetHead.innerText = `Welcome! ${UserInfo.firstname}`;
    ActiveDeposit.innerText = UserInfo.active_deposit;
    Profit.innerText = UserInfo.profit;
    RealPlan.innerText = UserInfo.realplan;
    TotalPropertiesOwned.innerText = UserInfo.total_properties_owned;
    TotalBalance.innerText = UserInfo.total_balance;
  }
}
window.addEventListener('load', Checkcred);

let Signout = () => {
  sessionStorage.removeItem("user-creds"); 
  sessionStorage.removeItem("user-info");  
  window.location.href = "index.html";
}
SignoutBtn.addEventListener('click', Signout);
