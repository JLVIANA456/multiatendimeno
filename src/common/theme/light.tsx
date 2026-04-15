import { DefaultTheme } from "styled-components";

export const lightTheme: DefaultTheme = {
  splash: {
    bg: "rgb(240, 240, 240)",
    gradient:
      "linear-gradient(90deg,rgba(240, 240, 240, 0.5) 0,rgba(240, 240, 240, 0.5) 33.33%,rgba(240, 240, 240, 0) 44.1%,rgba(240, 240, 240, 0) 55.8%, rgba(240, 240, 240, 0.5) 66.66%, rgba(240, 240, 240, 0.5))",
    logoFill: "rgb(191, 191, 191)",
    progressBg: "rgb(230, 230, 230)",
    progressAfterBg: "#42CBA5",
    titleColor: "#525252",
    subTitleColor: "rgba(0, 0, 0, 0.45)",
    iconColor: "rgba(0, 0, 0, 0.25)",
  },
  layout: {
    bg: "#ffffff",
    contentBoxShadowColor: "none",
  },
  sidebar: {},
  search: {
    iconColor: "#00DC81",
  },
  options: {
    bg: "#ffffff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },
  unselectedChat: {
    bg: "#ffffff",
  },
  chatRoom: {
    bg: "#fafafa",
    scrollBtnBoxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    profileBoxShadow: "none",
    profileHeadingColor: "#00DC81",
    profileActionColor: "#ff4d4f",
  },
  common: {
    borderColor: "#f0f0f0",
    primaryColor: "#fcfcfc",
    mainHeadingColor: "#1a1a1a",
    subHeadingColor: "#8c8c8c",
    secondaryColor: "white",
    tertiaryColor: "#00DC81",
    readIconColor: "#00DC81",
    unreadIconColor: "#d9d9d9",
    headerIconColor: "#bfbfbf",
  },
  alert: {
    infoColor: "#e6fdf5",
    iconContainerColor: "white",
    closeIconColor: "#8c8c8c",
  },
  badge: {
    textColor: "#ffffff",
    bgColor: "#00DC81",
  },
  sentMessage: {
    textColor: "#1a1a1a",
    bgColor: "#e6fdf5",
  },
  receivedMessage: {
    textColor: "#1a1a1a",
    bgColor: "#f5f5f5",
  },
  encryptionMessage: {
    bgColor: "#fcfcfc",
    textColor: "#bfbfbf",
  },
};
