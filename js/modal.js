

  const boxbody = document.getElementById("boxwrap");
  const boxbodyWith = document.getElementById("boxwrap-with");

  const closeBox = document.getElementById('closebox');
  const closeBoxWith = document.getElementById("closebox-with");

  // const preview = document.getElementById('close-btn');
  // const previewWith = document.getElementById('close-btn');


  function showbox() {
    boxbody.style.display = "flex";
  }
  function closebox() {
    boxbody.style.display = "none";
  }

  function showboxW() {
    boxbodyWith.style.transition = ".9s";
    boxbodyWith.style.display = "flex";

  }
  function closeboxW() {
    boxbodyWith.style.display = "none";
  }


  // preview.addEventListener("click", showbox);
  // previewWith.addEventListener("click", showboxW);

  // closeBox.addEventListener("click", closebox);
  // closeBoxWith.addEventListener("click", closeboxW);