// favicon.js - Carga el logo en la pestaña automáticamente
(function () {
  const logoUrl = 'https://lacampana.co/wp-content/uploads/2021/05/cropped-FAVICON-LA-CAMPANA-32x32.png';

  // Verifica si ya existe una etiqueta de icono para no duplicarla
  let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  
  link.type = 'image/png';
  link.rel = 'shortcut icon';
  link.href = logoUrl;

  document.head.appendChild(link);
})();
