/* eslint-disable valid-typeof */
import ValidationError from "./Errors/ValidationError";
import { ERROR } from "./constants";

function checkError(condition, errorObj) {
  try {
    if (condition) {
      throw errorObj;
    }
  } catch (err) {
    console.error(`${err.name}: ${err.message}`);
    return false;
  }

  return true;
}

export function isConstructor(newTarget) {
  return checkError(!newTarget, new ValidationError(ERROR.NEW_MISSED));
}

export function validateObjectState(state) {
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

export function validateDocumentState(state) {
  return (
    validateObjectState(state) &&
    checkError(
      Object.entries(state).some(([key, val]) => {
        if (!Object.prototype.hasOwnProperty.call(documentType, key))
          return true;
        if (key !== "content" && typeof val !== documentType[key]) return true;
        if (
          key === "content" &&
          val !== null &&
          typeof val !== documentType[key]
        )
          return true;
        if (key === "documents" && !Array.isArray(val)) return true;

        return false;
      }),
      new ValidationError(ERROR.INVALID_DOCUMENT_STATE)
    )
  );
}

export function validateArrayState(state) {
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

export function validateDocumentListItemState(state) {
  return checkError(
    Object.entries(drawerItemType).some(([key, type]) => {
      if (!Object.prototype.hasOwnProperty.call(state, key)) return true;
      if (typeof state[key] !== type) return true;
      if (key === "documents" && !Array.isArray(state[key])) return true;

      return false;
    }),
    new ValidationError(ERROR.INVALID_DOCUMENT_LIST_ITEM_STATE)
  );
}

export function validateDocumentListState(state) {
  return (
    validateArrayState(state) &&
    checkError(
      !state.reduce(
        (acc, cur) => acc && validateDocumentListItemState(cur),
        true
      ),
      new ValidationError(ERROR.INVALID_DOCUMENT_LIST_STATE)
    )
  );
}

export function validateHeaderState(state) {
  return (
    validateArrayState(state) &&
    checkError(
      state.some((item) => {
        if (!validateObjectState(item)) return true;
        if (
          !Object.prototype.hasOwnProperty.call(item, "id") ||
          typeof item.id !== "number"
        )
          return true;
        if (
          !Object.prototype.hasOwnProperty.call(item, "title") ||
          typeof item.title !== "string"
        )
          return true;

        return false;
      }),
      new ValidationError(ERROR.INVALID_HEADER_STATE)
    )
  );
}

export function validateDashboardState(state) {
  return (
    validateObjectState(state) &&
    checkError(
      Object.entries(state).some(([key, val]) => {
        const numKey = parseInt(key, 10);
        if (Number.isNaN(numKey) || key.length !== numKey.toString().length)
          return true;
        if (!validateDashboardItemState(val)) return true;

        return false;
      }),
      new ValidationError(ERROR.INVALID_DASHBOARD_STATE)
    )
  );
}

const dashboardItemType = {
  title: "string",
  usedCount: "number",
  lastUsedTime: "number",
};

export function validateDashboardItemState(state) {
  return (
    validateObjectState(state) &&
    checkError(
      Object.entries(dashboardItemType).some(
        ([name, type]) =>
          !Object.prototype.hasOwnProperty.call(state, name) ||
          typeof state[name] !== type
      ),

      new ValidationError(ERROR.INVALID_DASHBOARD_STATE)
    )
  );
}
