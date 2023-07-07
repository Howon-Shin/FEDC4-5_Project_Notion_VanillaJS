export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export class RequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "RequestError";
  }
}

export const ERROR = {
  NEW_MISSED: "Current component is declared without 'new' keyword.",
  NONE_OBJECT_STATE: "Tried to set state using none object value.",
  INVALID_DOCUMENT_STATE: "Tried to set document's state using invalid data.",
  INVALID_DRAWER_STATE: "Tried to set drawer's state using invalid data.",
  INVALID_DRAWERITEM_STATE:
    "Tried to set drawer item's state using invalid data.",
  INVALID_HEADER_STATE: "Tried to set header's state using invalid data.",
  INVALID_HOME_STATE: "Tried to set home's state using invalid data.",
  NONE_ARRAY_STATE: "Tried to set state using none array value.",
  INVALID_REQUEST: "서버에 문제가 발생했습니다.\n 잠시 후 다시 시도해주세요.",
};
