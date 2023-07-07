import { isConstructor, isHeaderState } from "@Utils/validation";
import "./Header.css";
import { once } from "@Utils/once";
import { routeToDocument } from "@Utils/router";

export default function Header({ $target }) {
  if (!isConstructor(new.target)) {
    return;
  }

  const $header = document.createElement("header");

  this.state = [];

  this.setState = (nextState) => {
    if (!isHeaderState(nextState)) {
      return;
    }

    this.state = nextState;

    this.render();
  };

  this.init = once(() => {
    $header.className = "header";
    $target.appendChild($header);

    $header.addEventListener("click", (e) => {
      const $linkElement = e.target.closest("[data-id]");
      if (!$linkElement) return;

      routeToDocument($linkElement.dataset.id);
    });
  });

  this.render = () => {
    this.init();
    $header.innerHTML = `
      <nav class="header-nav">
        ${this.state
          .map(
            ({ id, title }, idx) => `
            <p class="header-title" data-id=${id}>${title}</p>
            ${
              idx < this.state.length - 1
                ? "<p class=header-title-divider> / </p>"
                : ""
            }
            `
          )
          .join("")}
      </nav>
    `;
  };

  this.render();
}
