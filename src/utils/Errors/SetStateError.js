export default class SetStateError extends Error {
  constructor(message) {
    super(message);
    this.name = "SetStateError";
  }
}
