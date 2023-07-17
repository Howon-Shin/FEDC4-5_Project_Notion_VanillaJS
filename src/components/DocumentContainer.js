import { registerStateSetter } from "@Utils/stateSetters";
import router from "@Utils/router";
import { EVENT } from "@Utils/constants";
import Document from "@Pages/Document/Document";
import Dashboard from "../pages/Dashboard/Dashboard";

export default function DocumentContainer({ $target }) {
  const $documentContainer = document.createElement("article");
  $target.appendChild($documentContainer);
  $documentContainer.className = "document-container";

  const dashboard = new Dashboard({ $target: $documentContainer });
  registerStateSetter(dashboard);

  const hotionDocument = new Document({ $target: $documentContainer });
  registerStateSetter(hotionDocument);

  const route = () => router({ $target: $documentContainer });
  window.addEventListener("load", route);
  window.addEventListener("popstate", route);
  window.addEventListener(EVENT.ROUTE, route);
}
