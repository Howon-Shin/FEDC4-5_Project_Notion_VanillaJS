import { ERROR, ValidationError } from "./Errors";

function checkError(condition, errorObj) {
  try {
    if (condition) {
      throw errorObj;
    }
  } catch (err) {
    console.error(err.name + ": " + err.message);
    return false;
  }

  return true;
}

export function isConstructor(newTarget) {
  return checkError(!newTarget, new ValidationError(ERROR.NEW_MISSED));
}

export function isObjectState(state) {
  return checkError(
    state === null || !(typeof state === "object"),
    new TypeError(ERROR.NONE_OBJECT_STATE)
  );
}

const documentType = {
  documentId: "number",
  title: "string",
  content: "string",
};

export function isDocumentState(state) {
  return (
    isObjectState(state) &&
    checkError(
      (() => {
        for (const [key, val] of Object.entries(state)) {
          if (!documentType.hasOwnProperty(key)) return true;
          if (typeof val !== documentType[key]) return true;
        }
        return false;
      })(),
      new ValidationError(ERROR.INVALID_DOCUMENT_STATE)
    )
  );
}

export function isArrayState(state) {
  return checkError(
    !Array.isArray(state),
    new TypeError(ERROR.NONE_ARRAY_STATE)
  );
}

const drawerItemType = {
  id: "number",
  title: "string",
  documents: "object",
};

export function isDrawerItemState(state) {
  return checkError(
    (() => {
      for (const [key, type] of Object.entries(drawerItemType)) {
        if (!state.hasOwnProperty(key)) return true;
        if (typeof state[key] !== type) return true;
        if (key === "documents" && !Array.isArray(state[key])) return true;
      }
      return false;
    })(),
    new ValidationError(ERROR.INVALID_DRAWERITEM_STATE)
  );
}

export function isDrawerState(state) {
  return (
    isArrayState(state) &&
    checkError(
      !state.reduce((acc, cur) => acc && isDrawerItemState(cur), true),
      new ValidationError(ERROR.INVALID_DRAWER_STATE)
    )
  );
}
