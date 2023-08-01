import { isConstructor, validateHeaderState } from "@Utils/validation";
import "./Header.css";
import once from "@Utils/once";
import { routeToDocument } from "@Utils/router";

export default function Header({ $target }) {
  if (!isConstructor(new.target)) {
    return;
  }

  const $header = document.createElement("header");
  const $headerNav = document.createElement("nav");

  this.state = [];

  this.setState = (nextState) => {
    if (!validateHeaderState(nextState)) {
      return;
    }

    this.state = nextState;

    this.render();
  };

  this.init = once(() => {
    $header.className = "header";
    $headerNav.className = "header-nav";

    $header.appendChild($headerNav);
    $target.appendChild($header);

    $header.addEventListener("click", (e) => {
      const $linkElement = e.target.closest("[data-id]");
      if (!$linkElement) return;

      const documentId = parseInt($linkElement.dataset.id, 10);

      routeToDocument(documentId);
    });
  });

  this.render = () => {
    this.init();
    $headerNav.innerHTML = `
      ${this.state
        .map(
          ({ id, title }) => `
            <p class="header-title" data-id=${id}>${title}</p>
          `
        )
        .join("<p class=header-title-divider> / </p>")}
      `;
  };

  this.render();
}
