import SetStateError from "./Errors/SetStateError";
import { getRootDocuments } from "./apis";
import { CONSTRUCTOR_NAME, ERROR } from "./constants";

export const stateSetters = {};

export function registerStateSetter(component) {
  const { name } = component.constructor;
  if (name && component.setState instanceof Function) {
    stateSetters[name] = (nextState) => component.setState(nextState);
  }
}

export function setStateOf(target, value) {
  try {
    if (!Object.prototype.hasOwnProperty.call(stateSetters, target)) {
      console.log(target, value);
      throw new SetStateError(ERROR.UNREGISTERED_SETTER);
    }
  } catch (err) {
    console.error(err.message);
    return;
  }

  stateSetters[target](value);
}

export async function patchSidebarState() {
  const rootDocuments = await getRootDocuments();
  setStateOf(CONSTRUCTOR_NAME.SIDEBAR, rootDocuments);
}
