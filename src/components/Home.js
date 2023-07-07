import { STORAGE } from "@Utils/constants";
import { once } from "@Utils/once";
import { getItem, removeItem, setItem } from "@Utils/storage";
import { isConstructor, isHomeItemState, isHomeState } from "@Utils/validation";

export default function Home({ $target }) {
  if (!isConstructor(new.target)) {
    return;
  }

  const $home = document.createElement("section");
  const $recent = document.createElement("section");
  const $most = document.createElement("section");

  this.state = (() => {
    const localRecord = getItem(STORAGE.RECORD, {});
    if (isHomeState(localRecord)) {
      return localRecord;
    } else {
      removeItem(STORAGE.RECORD);
      return {};
    }
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
        numUsed: (this.state[id]?.numUsed ?? 0) + 1,
        lastUsedTime: new Date().getTime(),
      };
    }

    setItem(STORAGE.RECORD, JSON.stringify(this.state));
  };

  this.init = once(() => {
    $home.appendChild($recent);
    $home.appendChild($most);
  });

  this.render = () => {
    this.init();
    $target.appendChild($home);

    $recent.innerHTML = `
      ${Object.entries(this.state)
        .sort(
          ([aid, aval], [bid, bval]) => bval.lastUsedTime - aval.lastUsedTime
        )
        .slice(0, 10)
        .map(([id, { title }]) => `<p data-id=${id}>${title}</p>`)
        .join("")}
    `;

    $most.innerHTML = `
      ${Object.entries(this.state)
        .sort(([aid, aval], [bid, bval]) => bval.numUsed - aval.numUsed)
        .slice(0, 10)
        .map(([id, { title }]) => `<p data-id=${id}>${title}</p>`)
        .join("")}
    `;
  };
}
