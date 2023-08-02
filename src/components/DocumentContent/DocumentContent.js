import once from "@Utils/once";
import { isConstructor } from "@Utils/validation";
import "./DocumentContent.css";

function isEmptyBackspace({ selection, $self }) {
  return selection.focusNode === $self && selection.focusOffset === 0;
}

export default function DocumentContent({
  $target,
  content,
  updateContent,
  modifyContentList,
}) {
  if (!isConstructor(new.target)) {
    return;
  }

  const $content = document.createElement("div");
  const selection = window.getSelection();

  this.state = content;

  this.setState = (nextState) => {
    this.state = nextState;
    updateContent();

    this.render();
  };

  this.init = once(() => {
    $content.contentEditable = true;
    $content.className = "document-content";
    $content.innerText = this.state;

    $target.appendChild($content);

    $content.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const newContent = new DocumentContent({
          $target,
          content: "",
          updateContent,
          modifyContentList,
        });
        modifyContentList(this, newContent);
      } else if (
        e.key === "Backspace" &&
        isEmptyBackspace({ selection, $self: $content })
      ) {
        e.preventDefault();

        $target.removeChild($content);
        modifyContentList(this);
      }
    });

    $content.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
      }
    });

    $content.addEventListener("input", (e) => {
      this.setState(e.target.innerText);
    });
  });

  this.render = () => {
    this.init();
  };

  this.render();
}
