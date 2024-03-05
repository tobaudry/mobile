function afficherLoader() {
  // Création des éléments HTML pour le loader
  var showbox = document.createElement("div");
  showbox.classList.add("showbox");

  var loader = document.createElement("div");
  loader.classList.add("loader");

  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("circular");
  svg.setAttribute("viewBox", "25 25 50 50");

  var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.classList.add("path");
  circle.setAttribute("cx", "50");
  circle.setAttribute("cy", "50");
  circle.setAttribute("r", "20");
  circle.setAttribute("fill", "none");
  circle.setAttribute("stroke-width", "2");
  circle.setAttribute("stroke-miterlimit", "10");

  // Ajout des éléments dans le DOM
  svg.appendChild(circle);
  loader.appendChild(svg);
  showbox.appendChild(loader);
  document.body.appendChild(showbox);
}
export default afficherLoader;
