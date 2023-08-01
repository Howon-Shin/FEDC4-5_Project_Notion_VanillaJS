import { deleteDocument, postDocument } from "@Utils/apis";
import { ACTION, CONSTRUCTOR_NAME, EVENT } from "@Utils/constants";
import { routeToDocument, routeToHome } from "@Utils/router";
import { patchSidebarState, setStateOf } from "@Utils/stateSetters";

function isActivated(id) {
  const { pathname } = window.location;
  if (pathname.indexOf("/documents/") !== 0) {
    return false;
  }

  const [, , documentIdStr] = pathname.split("/");
  const documentId = parseInt(documentIdStr, 10);

  return documentId === id;
}

export function handleOpen() {
  if (this.constructor.name !== "DocumentListItem") return;

  const $openBtn = this.$item.querySelector(".btn-open-list");
  $openBtn.className = `btn-open-list${this.opened ? " opened" : ""}`;

  this.childrenDocumentList.root.style.display = this.opened ? "block" : "none";
}

export function activate() {
  if (this.constructor.name !== "DocumentListItem") return;

  if (isActivated(this.state.id)) {
    this.$titleContainer.className = "container-list-item activated";

    let curParent = this.parent;
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
    this.$titleContainer.className = "container-list-item";
  }
}

export function updateTitle(title) {
  if (this.constructor.name !== "DocumentListItem") return;

  this.setState({
    ...this.state,
    title: title || "제목없음",
  });
}

export async function handleAppend() {
  if (this.constructor.name !== "DocumentListItem") return;

  const newDocument = await postDocument({
    title: "제목없음",
    parent: this.state.id,
  });
  if (newDocument) {
    patchSidebarState();
    this.setOpened(true);
    routeToDocument(newDocument.id);
  }
}

export async function handleRemove() {
  if (this.constructor.name !== "DocumentListItem") return;

  this.disable = true;

  const response = await deleteDocument({ documentId: this.state.id });
  if (response) {
    patchSidebarState();
    window.removeEventListener(EVENT.ROUTE_DOCUMENT_LIST, this.activate);
    window.removeEventListener(EVENT.TITLE_UPDATED, this.updateTitle);
    this.$titleContainer.removeEventListener("click", this.handleClick);

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
}

export async function handleClick(e) {
  if (this.constructor.name !== "DocumentListItem") return;
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
}
