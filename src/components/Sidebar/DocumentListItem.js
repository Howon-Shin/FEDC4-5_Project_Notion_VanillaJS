import once from "@Utils/once";
import {
  isConstructor,
  validateDocumentListItemState,
} from "@Utils/validation";
import "./DocumentListItem.css";
import { EVENT } from "@Utils/constants";
import openIcon from "@Static/openIcon.svg";
import plusIcon from "@Static/plusIcon.svg";
import trashIcon from "@Static/trashIcon.svg";
import DocumentList from "./DocumentList";
import {
  activate,
  handleAppend,
  handleClick,
  handleOpen,
  handleRemove,
  updateTitle,
} from "./DocumentListItem.handler";

export default function DocumentListItem({ $target, $sibling, parent, level }) {
  if (!isConstructor(new.target)) {
    return;
  }

  this.$item = document.createElement("div");
  this.$titleContainer = document.createElement("div");
  this.childrenDocumentList = new DocumentList({
    $target: this.$item,
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

  this.toggleOpen = handleOpen.bind(this);

  // url로 문서 활성화 여부 검사 후 맞으면 본인 강조
  this.activate = activate.bind(this);

  this.updateTitle = updateTitle.bind(this);

  this.handleAppend = handleAppend.bind(this);

  this.handleRemove = handleRemove.bind(this);

  this.handleClick = handleClick.bind(this);

  this.init = once(() => {
    $target.insertBefore(this.$item, $sibling);
    this.$item.insertAdjacentElement("afterbegin", this.$titleContainer);

    this.$titleContainer.className = "container-list-item";
    this.$titleContainer.style.paddingLeft = `${10 * level}px`;
    this.$titleContainer.innerHTML = `
      <button class="btn-open-list" data-action="open">${openIcon}</button>
      <p class="list-item-title" data-action="route">${this.state.title}</p>
      <div class="container-item-btns">
        <button data-action="remove">${trashIcon}</button>
        <button data-action="append">${plusIcon}</button>
      </div>
    `;

    this.$titleContainer.addEventListener("click", this.handleClick);

    window.addEventListener(EVENT.ROUTE_DOCUMENT_LIST, this.activate);
    window.addEventListener(EVENT.TITLE_UPDATED, (e) => {
      const { id, title } = e.detail;
      if (id === this.state.id) this.updateTitle(title);
    });

    this.activate();
    this.toggleOpen();
  });

  this.render = () => {
    this.init();

    const $title = this.$item.querySelector(".list-item-title");
    $title.textContent = this.state.title;

    this.childrenDocumentList.setState(this.state.documents);

    this.activate();
  };
}
