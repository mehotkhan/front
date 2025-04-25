export default defineAppConfig({
  installed: true,
  ui: {
    colors: {
      primary: "zinc",
    },
  },
  mainMenu: [
    {
      label: "Home",
      to: "/",
    },
    {
      label: "logs",
      to: "/logs",
    },
    {
      label: "About",
      to: "/about",
    },
  ],
  dashMenu: [
    {
      label: "Dashboard",
      to: "/manage",
    },
    {
      label: "Pages",
      to: "/manage/pages",
    },
    {
      label: "Comments",
      to: "/manage/comments",
    },
    {
      label: "Newsletter",
      to: "/manage/newsletter",
    },
    {
      label: "Users",
      to: "/manage/users",
    },
    {
      label: "Builds",
      to: "/manage/builds",
    },
    {
      label: "Settings",
      to: "/manage/settings",
    },
  ],
  app: {
    site_name_fa: "مُـهِِــت",
    title_fa: "مُـ هِــت",
    description_fa: "توسعه دهنده متن باز",
    site_name_en: " Mohet",
    title_en: "Mo het",
    description_en: "OpenSourceWebDeveloper",
    footer_fa:
      ' همه چیز به شکل شگفت انگیزی خوب باید باشد، ساخته شده توسط <a href="https://github.com/Bagche/Mamoochi" target="_blank">مَموچی</a>',
    footer_en:
      'Everything should be wonderfully perfect in every way, crafted by <a href="https://github.com/Bagche/Mamoochi" target="_blank">Mamoochi</a>',

    default_banner: "/content/blogging.webp",
    default_avatar: "/content/gnu.webp",
  },
  cats: ["library", "notes", "projects", "tuts"],
});
