import once from "@Utils/once";
import { isConstructor, validateDocumentState } from "@Utils/validation";
import "./Document.css";
import { putDocument } from "@Utils/apis";
import { patchSidebarState } from "@Utils/stateSetters";
import { EVENT } from "@Utils/constants";
import { routeToDocument } from "@Utils/router";
import DocumentContent from "@Components/DocumentContent/DocumentContent";

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
    if (!validateDocumentState(this.state)) {
      return;
    }

    const doesDocumentChanged =
      nextState.id !== undefined && this.state.id !== nextState.id;

    if (doesDocumentChanged) {
      this.contentList = [];
    }

    this.state = {
      ...this.state,
      ...nextState,
    };

    this.render(doesDocumentChanged);
  };

  this.dispatchTitle = (title) => {
    window.dispatchEvent(
      new CustomEvent(EVENT.TITLE_UPDATED, {
        detail: {
          id: this.state.id,
          title,
        },
      })
    );
  };

  this.autoSave = () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(
      ((state) => async () => {
        const { id: documentId, title, content } = state;
        await putDocument({
          documentId,
          title: title.length ? title : "제목없음",
          content,
        });

        patchSidebarState();
      })(this.state),
      1500
    );
  };

  this.toggleTemplateBtn = (toVisible) => {
    const $template = $document.querySelector(".section-template");
    if (toVisible) {
      $template.style.display = "block";
    } else {
      $template.style.display = "none";
    }
  };

  this.contentList = [];

  this.modifyContentList = (curItem, itemToAdd) => {
    const index = this.contentList.findIndex((content) => content === curItem);

    if (index < 0) return;

    if (itemToAdd) {
      this.contentList.splice(index + 1, 0, itemToAdd);
    } else {
      this.contentList.splice(index, 1);
    }

    this.updateContent();
  };

  this.updateContent = () => {
    const totalContent =
      this.contentList.map((item) => item.state).join("<br>") ?? null;
    this.setState({ content: totalContent });

    this.autoSave();
  };

  this.init = once(() => {
    $document.className = "document-container";
    $document.innerHTML = `
      <section class="section-title">
        <textarea name="title" value="${this.state.title}"></textarea>
      </section>
      <section class="section-content"></section>
      <section class="section-template">
        <button class="btn-empty-page">빈 페이지</button>
      </section>
      <nav class="list-children"></nav>
    `;

    $document.querySelector("[name=title]").addEventListener("input", (e) => {
      this.setState({
        [e.target.name]: e.target.value,
      });

      this.dispatchTitle(e.target.value);
      this.autoSave();
    });

    $document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-id]");
      if (!link) return;

      const { id } = link.dataset;
      routeToDocument(parseInt(id, 10));
    });

    $document.querySelector(".btn-empty-page").addEventListener("click", () => {
      this.setState({ content: "" });
      this.contentList = [
        new DocumentContent({
          $target: $document.querySelector(".section-content"),
          content: "",
          updateContent: this.updateContent,
          modifyContentList: this.modifyContentList,
        }),
      ];
    });
  });

  this.render = (doesDocumentChanged) => {
    this.init();

    if ($target.firstElementChild === null) {
      $target.appendChild($document);
    }

    const $title = $document.querySelector("[name=title]");
    $title.value = this.state.title;

    const $contentSection = $document.querySelector(".section-content");

    if (this.state.content === null) {
      this.toggleTemplateBtn(true);
    } else {
      this.toggleTemplateBtn(false);
    }

    if (doesDocumentChanged) {
      $contentSection.innerHTML = "";

      if (this.state.content !== null) {
        this.state.content.split("<br>").forEach((line) => {
          this.contentList = [
            ...this.contentList,
            new DocumentContent({
              $target: $contentSection,
              content: line,
              updateContent: this.updateContent,
              modifyContentList: this.modifyContentList,
            }),
          ];
        });
      }
    }

    const $childList = $document.querySelector(".list-children");
    $childList.innerHTML = `
      ${this.state.documents
        .map(
          ({ id, title }) =>
            `<a class="document-child" data-id=${id}>${title}</a>`
        )
        .join("")}
    `;
  };
}
