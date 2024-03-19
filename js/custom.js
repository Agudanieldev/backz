

document.onreadystatechange = function () {
  if (document.readyState !== "complete") {
    document.querySelector('.preloader-wrapper2').style.visibility = "visible";
    document.body.style.overflow = "hidden"; // Prevent scrolling while loading
  } else {
    document.querySelector('.preloader-wrapper2').style.display = "none";
    document.body.style.overflow = "auto"; // Re-enable scrolling after loading
  }
};
