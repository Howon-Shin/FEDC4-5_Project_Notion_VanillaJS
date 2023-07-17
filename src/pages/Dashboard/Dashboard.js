import { CONSTRUCTOR_NAME, STORAGE } from "@Utils/constants";
import once from "@Utils/once";
import { getItem, removeItem, setItem } from "@Utils/storage";
import { isConstructor, validateDashboardState } from "@Utils/validation";
import "./Dashboard.css";
import { routeToDocument } from "@Utils/router";
import { setStateOf } from "@Utils/stateSetters";

export default function Dashboard({ $target }) {
  if (!isConstructor(new.target)) {
    return;
  }

  const $dashboard = document.createElement("section");
  const $recent = document.createElement("section");
  const $frequent = document.createElement("section");

  this.state = (() => {
    const localRecord = getItem(STORAGE.RECORD, {});
    if (validateDashboardState(localRecord)) {
      return localRecord;
    }

    removeItem(STORAGE.RECORD);
    return {};
  })();

  this.setState = (nextState) => {
    if (nextState === null) {
      this.render();
      return;
    }

    const { id, title, toRemove = false } = nextState;

    if (toRemove) {
      delete this.state[id];
    } else {
      this.state[id] = {
        title,
        usedCount: (this.state[id]?.usedCount ?? 0) + 1,
        lastUsedTime: new Date().getTime(),
      };
    }

    setItem(STORAGE.RECORD, JSON.stringify(this.state));
  };

  this.init = once(() => {
    $dashboard.className = "dashboard-container";
    $recent.className = "dashboard-recent-container";
    $frequent.className = "dashboard-frequent-container";

    $dashboard.appendChild($recent);
    $dashboard.appendChild($frequent);

    $dashboard.addEventListener("click", (e) => {
      const $docLink = e.target.closest("[data-id]");
      if (!$docLink) return;

      const { id } = $docLink.dataset;
      routeToDocument(id);
    });
  });

  this.render = () => {
    this.init();
    if ($target.firstElementChild === null) {
      $target.appendChild($dashboard);
    }

    $recent.innerHTML = `
      <p class="dashboard-recent-title">⏰ 최근 사용한 문서</p>
      ${Object.entries(this.state)
        .sort(
          ([aid, aval], [bid, bval]) => bval.lastUsedTime - aval.lastUsedTime
        )
        .slice(0, 10)
        .map(([id, { title }]) => `<p data-id=${id}>${title}</p>`)
        .join("")}
    `;

    $frequent.innerHTML = `
      <p class="dashboard-frequent-title">🗂️ 자주 사용한 문서</p>
      ${Object.entries(this.state)
        .sort(([aid, aval], [bid, bval]) => bval.usedCount - aval.usedCount)
        .slice(0, 10)
        .map(([id, { title }]) => `<p data-id=${id}>${title}</p>`)
        .join("")}
    `;

    setStateOf(CONSTRUCTOR_NAME.HEADER, []);
  };
}
