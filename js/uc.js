

let UserCreds = JSON.parse(sessionStorage.getItem("user-creds"));
let UserInfo = JSON.parse(sessionStorage.getItem("user-info"));

let MsgHead = document.getElementById('msg');
let GreetHead = document.getElementById('greet');
let MainBalance = document.getElementById('mainbalance');
let SignoutBtn = document.getElementById('signoutbutton');


let Checkcred = () => {
  if (!sessionStorage.getItem("user-creds"))
    window.location.href = "https://tradezanga.com/login.html";
  else {
    MsgHead.innerText = `${UserCreds.email}`;
    GreetHead.innerText = `Welcome! ${UserInfo.firstname}`;
    MainBalance.innerText = `${UserInfo.balance}`;
  }
}

let Signout = () => {
  sessionStorage.removeItem("user-creds"); 
  sessionStorage.removeItem("user-info");  
  window.location.href = "https://tradezanga.com/login.html";
}
// window.addEventListener('load', Checkcred);
SignoutBtn.addEventListener('click', Signout);