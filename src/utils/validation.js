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
  id: "number",
  title: "string",
  content: "string",
  documents: "object",
  createdAt: "string",
  updatedAt: "string",
};

export function isDocumentState(state) {
  return (
    isObjectState(state) &&
    checkError(
      (() => {
        for (const [key, val] of Object.entries(state)) {
          if (!documentType.hasOwnProperty(key)) return true;
          if (key !== "content" && typeof val !== documentType[key])
            return true;
          if (
            key === "content" &&
            val !== null &&
            typeof val !== documentType[key]
          )
            return true;
          if (key === "documents" && !Array.isArray(val)) return true;
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

export function isHeaderState(state) {
  return (
    isArrayState(state) &&
    checkError(
      (() => {
        for (const item of state) {
          if (!isObjectState(item)) return true;
          if (!item.hasOwnProperty("id") || typeof item.id !== "number")
            return true;
          if (!item.hasOwnProperty("title") || typeof item.title !== "string")
            return true;
        }
        return false;
      })(),
      new ValidationError(ERROR.INVALID_HEADER_STATE)
    )
  );
}

export function isHomeState(state) {
  return (
    isObjectState(state) &&
    checkError(
      (() => {
        for (const [key, val] of Object.entries(state)) {
          const numKey = parseInt(key);
          if (isNaN(numKey) || key.length !== numKey.toString().length)
            return true;
          if (!isHomeItemState(val)) return true;
        }
        return false;
      })(),
      new ValidationError(ERROR.INVALID_HOME_STATE)
    )
  );
}

const homeItemType = {
  title: "string",
  numUsed: "number",
  lastUsedTime: "number",
};

export function isHomeItemState(state) {
  return (
    isObjectState(state) &&
    checkError(
      (() => {
        for (const [name, type] of Object.entries(homeItemType)) {
          if (!state.hasOwnProperty(name) || typeof state[name] !== type)
            return true;
        }
      })(),
      new ValidationError(ERROR.INVALID_HOME_STATE)
    )
  );
}
