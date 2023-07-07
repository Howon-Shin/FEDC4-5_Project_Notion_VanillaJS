import { once } from "@Utils/once";
import { isConstructor, isDocumentState } from "@Utils/validation";
import "./Document.css";
import { putDocument } from "@Utils/apis";
import { patchSidebarState } from "@Utils/stateSetters";

export default function Document({ $target }) {
  if (!isConstructor(new.target)) {
    return;
  }

  let timer;
  const $document = document.createElement("section");

  this.state = {
    id: 0,
    title: "",
    content: "",
    documents: [],
  };

  this.setState = (nextState) => {
    if (!isDocumentState(this.state)) {
      return;
    }

    this.state = {
      ...this.state,
      ...nextState,
    };

    this.render();
  };

  this.init = once(() => {
    $document.className = "document-container";
    $document.innerHTML = `
      <section class="document-title-section">
        <textarea name="title" value="${this.state.title}"></textarea>
      </section>
      <section class="document-content-section">
        <textarea name="content"></textarea>
      </section>
    `;

    $document.querySelectorAll("[name]").forEach(($textarea) => {
      $textarea.addEventListener("input", (e) => {
        this.setState({
          [e.target.name]: e.target.value,
        });

        if (e.target.name === "title") {
          window.dispatchEvent(
            new CustomEvent("title-updated", {
              detail: {
                id: this.state.id,
                title: e.target.value,
              },
            })
          );
        }

        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(
          (function (state) {
            return async () => {
              const { id: documentId, title, content } = state;
              await putDocument({
                documentId,
                title: title.length ? title : "제목없음",
                content,
              });

              patchSidebarState();
            };
          })(this.state),
          3000
        );
      });
    });
  });

  this.render = () => {
    this.init();
    if ($target.firstElementChild === null) {
      $target.appendChild($document);
    }

    const $title = $document.querySelector("[name=title]");
    $title.value = this.state.title;

    const $content = $document.querySelector("[name=content]");
    $content.value = this.state.content;
  };
}
