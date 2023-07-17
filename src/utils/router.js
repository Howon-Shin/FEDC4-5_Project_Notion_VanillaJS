import { CONSTRUCTOR_NAME, EVENT } from "@Utils/constants";
import { setStateOf } from "@Utils/stateSetters";
import { getDocument } from "./apis";

let lastPageName = "";
export default async function router({ $target }) {
  const { pathname } = window.location;

  if (pathname === "/") {
    clearPageWhenTransition({
      $target,
      curPageName: CONSTRUCTOR_NAME.DASHBOARD,
    });
    setStateOf(CONSTRUCTOR_NAME.DASHBOARD, null);
  } else if (pathname.indexOf("/documents/") === 0) {
    const [, , documentIdStr] = pathname.split("/");
    const documentId = parseInt(documentIdStr, 10);

    const documentData = await getDocument({ documentId });

    if (documentData) {
      clearPageWhenTransition({
        $target,
        curPageName: CONSTRUCTOR_NAME.DOCUMENT,
      });
      setStateOf(CONSTRUCTOR_NAME.DOCUMENT, documentData);
    } else {
      routeToHome();
    }
  }

  window.dispatchEvent(new CustomEvent(EVENT.ROUTE_DRAWER));
}

function clearPageWhenTransition({ $target, curPageName }) {
  if (lastPageName !== curPageName) {
    // eslint-disable-next-line no-param-reassign
    $target.innerHTML = "";
    lastPageName = curPageName;
  }
}

export function routeToDocument(targetDocumentId) {
  const { pathname } = window.location;
  const [, , documentIdStr] = pathname.split("/");
  const documentId = parseInt(documentIdStr, 10);
  console.log(documentId, targetDocumentId);
  if (documentId !== targetDocumentId) {
    window.history.pushState(null, null, `/documents/${targetDocumentId}`);
  }
  window.dispatchEvent(new CustomEvent(EVENT.ROUTE));
}

export function routeToHome({ replace = false } = {}) {
  if (replace) {
    window.history.replaceState(null, null, "/");
  } else {
    window.history.pushState(null, null, "/");
  }
  window.dispatchEvent(new CustomEvent(EVENT.ROUTE));
}
