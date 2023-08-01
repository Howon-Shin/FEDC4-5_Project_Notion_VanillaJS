import RequestError from "./Errors/RequestError";
import { ERROR } from "./constants";

const API_END_POINT = "https://kdt-frontend.programmers.co.kr";

async function request(url, options = {}) {
  try {
    const response = await fetch(
      `${API_END_POINT}${url[0] !== "/" ? "/" : ""}${url}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "x-username": "howon",
        },
      }
    );

    if (!response.ok) {
      throw new RequestError(ERROR.INVALID_REQUEST);
    }

    return response.json();
  } catch (err) {
    alert(err.message);
    return null;
  }
}

export async function getRootDocuments() {
  return request("/documents");
}

export async function getDocument({ documentId }) {
  return request(`/documents/${documentId}`);
}

export async function postDocument({ title, parent }) {
  return request("/documents", {
    method: "POST",
    body: JSON.stringify({
      title,
      parent,
    }),
  });
}

export async function putDocument({ documentId, title, content }) {
  return request(`/documents/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({
      title,
      content,
    }),
  });
}

export async function deleteDocument({ documentId }) {
  return request(`/documents/${documentId}`, {
    method: "DELETE",
  });
}
