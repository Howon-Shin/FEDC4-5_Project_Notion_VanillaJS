import once from "@Utils/once";
import {
  isConstructor,
  validateDocumentListItemState,
} from "@Utils/validation";
import "./DocumentListItem.css";
import { deleteDocument, postDocument } from "@Utils/apis";
import { patchSidebarState, setStateOf } from "@Utils/stateSetters";
import { routeToDocument, routeToHome } from "@Utils/router";
import { ACTION, CONSTRUCTOR_NAME, EVENT } from "@Utils/constants";
import openIcon from "@Static/openIcon.svg";
import plusIcon from "@Static/plusIcon.svg";
import trashIcon from "@Static/trashIcon.svg";
import DocumentList from "./DocumentList";

export default function DocumentListItem({ $target, $sibling, parent, level }) {
  if (!isConstructor(new.target)) {
    return;
  }

  const $item = document.createElement("div");
  const $titleContainer = document.createElement("div");
  const $childrenDocumentList = new DocumentList({
    $target: $item,
    parent: this,
    level: level + 1,
  });

  this.state = { id: 0, title: "", documents: [] };

  this.setState = (nextState) => {
    if (!validateDocumentListItemState(nextState)) {
      return;
    }

    this.state = nextState;

    this.render();
  };

  this.parent = parent;

  this.disable = false;

  this.opened = false;

  this.setOpened = (nextOpened) => {
    this.opened = nextOpened;
    this.toggleOpen();
  };

  this.toggleOpen = () => {
    const $openBtn = $item.querySelector(".document-list-item-open-button");
    $openBtn.className = `document-list-item-open-button${
      this.opened ? " opened" : ""
    }`;

    $childrenDocumentList.root.style.display = this.opened ? "block" : "none";
  };

  // url로 문서 활성화 여부 검사 후 맞으면 본인 강조
  this.activate = () => {
    if (isActivated(this.state.id)) {
      $titleContainer.className = "document-list-item-container activated";

      let curParent = parent;
      const docsInfo = [
        {
          id: this.state.id,
          title: this.state.title,
        },
      ];

      while (curParent) {
        curParent.setOpened(true);

        docsInfo.unshift({
          id: curParent.state.id,
          title: curParent.state.title,
        });

        curParent = curParent.parent;
      }

      setStateOf(CONSTRUCTOR_NAME.HEADER, docsInfo);

      const { id, title } = this.state;
      setStateOf(CONSTRUCTOR_NAME.DASHBOARD, { id, title });
    } else {
      $titleContainer.className = "document-list-item-container";
    }
  };

  this.updateTitle = (title) => {
    this.setState({
      ...this.state,
      title: title || "제목없음",
    });
  };

  this.handleAppend = async () => {
    const newDocument = await postDocument({
      title: "제목없음",
      parent: this.state.id,
    });
    if (newDocument) {
      patchSidebarState();
      this.setOpened(true);
      routeToDocument(newDocument.id);
    }
  };

  this.handleRemove = async () => {
    this.disable = true;

    const response = await deleteDocument({ documentId: this.state.id });
    if (response) {
      patchSidebarState();
      window.removeEventListener(EVENT.ROUTE_DRAWER, this.activate);
      window.removeEventListener(EVENT.TITLE_UPDATED, this.updateTitle);
      $titleContainer.removeEventListener("click", this.handleClick);

      setStateOf(CONSTRUCTOR_NAME.DASHBOARD, {
        id: this.state.id,
        toRemove: true,
      });

      if (isActivated(this.state.id)) {
        routeToHome({ replace: true });
      }
    } else {
      this.disable = true;
    }
  };

  this.handleClick = async (e) => {
    if (this.disable) return;

    const $actionElement = e.target.closest("[data-action]");
    if (!$actionElement) return;

    const { action } = $actionElement.dataset;

    if (action === ACTION.OPEN) {
      this.setOpened(!this.opened);
    } else if (action === ACTION.APPEND) {
      this.handleAppend();
    } else if (action === ACTION.REMOVE) {
      this.handleRemove();
    } else if (action === ACTION.ROUTE) {
      routeToDocument(this.state.id);
    }
  };

  this.init = once(() => {
    $target.insertBefore($item, $sibling);
    $item.insertAdjacentElement("afterbegin", $titleContainer);

    $titleContainer.className = "document-list-item-container";
    $titleContainer.style.paddingLeft = `${10 * level}px`;
    $titleContainer.innerHTML = `
      <button class="document-list-item-open-button" data-action="open">${openIcon}</button>
      <p class="document-list-item-title" data-action="route">${this.state.title}</p>
      <div class="document-list-item-btn-container">
        <button data-action="remove">${trashIcon}</button>
        <button data-action="append">${plusIcon}</button>
      </div>
    `;

    $titleContainer.addEventListener("click", this.handleClick);

    window.addEventListener(EVENT.ROUTE_DRAWER, this.activate);
    window.addEventListener(EVENT.TITLE_UPDATED, (e) => {
      const { id, title } = e.detail;
      if (id === this.state.id) this.updateTitle(title);
    });

    this.activate();
    this.toggleOpen();
  });

  this.render = () => {
    this.init();

    const $title = $item.querySelector(".document-list-item-title");
    $title.innerText = this.state.title;

    $childrenDocumentList.setState(this.state.documents);

    this.activate();
  };
}

function isActivated(id) {
  const { pathname } = window.location;
  if (pathname.indexOf("/documents/") !== 0) {
    return false;
  }

  const [, , documentIdStr] = pathname.split("/");
  const documentId = parseInt(documentIdStr, 10);

  return documentId === id;
}
