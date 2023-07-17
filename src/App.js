import { patchSidebarState, registerStateSetter } from "@Utils/stateSetters";
import DocumentContainer from "@Components/DocumentContainer";
import Header from "@Components/Header/Header";
import Sidebar from "@Components/Sidebar/Sidebar";
import "./App.css";

export default function App({ $target }) {
  // 기본 레이아웃 요소 생성
  const sidebar = new Sidebar({ $target });
  registerStateSetter(sidebar);
  patchSidebarState();

  const $main = document.createElement("div");

  const header = new Header({ $target: $main });
  registerStateSetter(header);

  $main.className = "main-container";
  $target.appendChild($main);

  // route 로 변경되는 부분
  new DocumentContainer({ $target: $main });
}
