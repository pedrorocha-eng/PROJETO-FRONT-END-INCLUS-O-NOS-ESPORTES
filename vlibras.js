/* VLibras — tradutor oficial de Libras do Governo Federal (vlibras.gov.br).
   A marcação é inserida via JS porque o atributo customizado "vw" não é
   aceito pelo validador W3C; assim o HTML permanece 100% válido. */
(function () {
  "use strict";
  var wrap = document.createElement("div");
  wrap.setAttribute("vw", ""); wrap.className = "enabled";
  wrap.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
  document.body.appendChild(wrap);
  var s = document.createElement("script");
  s.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
  s.onload = function () { if (window.VLibras) new window.VLibras.Widget("https://vlibras.gov.br/app"); };
  document.body.appendChild(s);
})();
