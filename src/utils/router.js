import { NAME } from "@Utils/constants";
import { stateSetters } from "@Utils/stateSetters";
import { getDocument } from "./apis";

export default async function router({ $target }) {
  const { pathname } = window.location;

  $target.innerHTML = "";

  if (pathname === "/") {
    stateSetters[NAME.HOME](null);
  } else if (pathname.indexOf("/documents/") === 0) {
    const [, , documentIdStr] = pathname.split("/");
    const documentId = parseInt(documentIdStr);

    const documentData = await getDocument({ documentId });

    if (documentData) {
      stateSetters[NAME.DOCUMENT](documentData);
    } else {
      routeToHome();
    }
  }

  window.dispatchEvent(new CustomEvent("route-drawer"));
}

export function routeToDocument(documentId) {
  history.pushState(null, null, `/documents/${documentId}`);
  window.dispatchEvent(new CustomEvent("route"));
}

export function routeToHome() {
  history.pushState(null, null, "/");
  window.dispatchEvent(new CustomEvent("route"));
}
