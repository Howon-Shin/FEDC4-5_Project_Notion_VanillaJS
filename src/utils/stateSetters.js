import { getRootDocuments } from "./apis";
import { NAME } from "./constants";

export const stateSetters = {};

export function registerStateSetter(component) {
  const name = component.constructor.name;
  if (name && component.setState instanceof Function) {
    stateSetters[name] = (nextState) => component.setState(nextState);
  }
}

export async function patchSidebarState() {
  if (!stateSetters.hasOwnProperty(NAME.SIDEBAR)) {
    return;
  }

  const rootDocuments = await getRootDocuments();
  stateSetters[NAME.SIDEBAR](rootDocuments);
}
