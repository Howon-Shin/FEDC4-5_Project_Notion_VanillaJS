import once from "@Utils/once";
import { isConstructor } from "@Utils/validation";
import "./DocumentContent.css";

function isEmptyBackspace({ selection, $self }) {
  return selection.focusNode === $self && selection.focusOffset === 0;
}

export default function DocumentContent({ $target }) {
  if (!isConstructor(new.target)) {
    return;
  }

  const $content = document.createElement("div");
  const selection = window.getSelection();

  this.init = once(() => {
    $content.contentEditable = true;
    $content.className = "document-content";

    $target.appendChild($content);

    $content.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        new DocumentContent({ $target });
      } else if (
        e.key === "Backspace" &&
        isEmptyBackspace({ selection, $self: $content })
      ) {
        e.preventDefault();
        $target.removeChild($content);
      }
    });

    $content.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
      }
    });
  });

  this.render = () => {
    this.init();
  };

  this.render();
}
