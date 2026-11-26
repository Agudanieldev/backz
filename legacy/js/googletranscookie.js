
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,zh,es,fr,de,ar,hi,pt,ru,ja,ko,it,tr,nl,pl,uk,vi,fa,id,ro,th,cs,sv,fi,el,he,ms,hu,bg,da,ta,te,ml,bn,ur',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE
  }, 'google_translate_element');
} 



  // Store the selected language
  function setLanguageCookie(lang) {
    document.cookie = `googtrans=/en/${lang};path=/`;
  }

  // Monitor changes
  document.addEventListener('DOMContentLoaded', function () {
    const observer = new MutationObserver(function () {
      const iframe = document.querySelector('iframe.goog-te-menu-frame');
      if (!iframe) return;

      iframe.contentWindow.document.querySelectorAll('.goog-te-menu2-item span.text').forEach(function (el) {
        el.addEventListener('click', function () {
          const lang = el.innerHTML.trim().toLowerCase();
          setLanguageCookie(lang);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

  
  function customizeGoogleTranslateLabel() {
    const interval = setInterval(() => {
      const selectEl = document.querySelector('#google_translate_element select');
      if (selectEl) {
        const firstOption = selectEl.querySelector('option');
        if (firstOption && firstOption.innerHTML.includes('Select Language')) {
          firstOption.innerHTML = 'English'; // Change this to whatever you want
          clearInterval(interval);
        }
      }
    }, 100); // check every 100ms
  }

  window.addEventListener('load', customizeGoogleTranslateLabel);
