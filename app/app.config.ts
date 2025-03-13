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
      // icon: "i-lucide-home",
      to: "/",
    },
    {
      label: "logs",
      // icon: "i-lucide-search",
      to: "/logs",
    },
    {
      label: "About",
      // icon: "i-lucide-info",
      to: "/about",
    },
    {
      label: "Contact",
      // icon: "i-lucide-mail",
      to: "/contact",
    },
  ],
  dashMenu: [
    {
      label: "Dashboard",
      // type: "label",
      // icon: "i-lucide-book-open",
      to: "/manage",
    },
    {
      label: "Items",
      // icon: "i-lucide-book-open",
      // active: true,
      // defaultOpen: true,
      to: "/manage/items",
    },
    {
      label: "Comments",
      // icon: "i-lucide-database",
      to: "/manage/comments",
    },
    {
      label: "Users",
      // icon: "i-lucide-box",
      to: "/manage/users",
      // defaultOpen: true,
    },
    {
      label: "Builds",
      // type: "label",
      // icon: "i-lucide-book-open",
      to: "/manage/builds",
    },
    {
      label: "Settings",
      // type: "label",
      // icon: "i-lucide-book-open",
      to: "/manage/settings",
    },
  ],
  corePermissions: [
    "dashboard.read",
    "dashboard.edit",

    "users.all",
    "users.edit",
    "users.delete",

    "roles.read",
    "roles.edit",
    "roles.delete",

    "comment.create",
    "comment.read",
    "comment.edit",
    "comment.delete",

    "item.create",
    "item.read",
    "item.edit",
    "item.delete",

    "page.create",
    "page.read",
    "page.edit",
    "page.delete",

    "media.upload",
    "media.read",
    "media.delete",

    "cdn.update",
    "config.manage",
  ],
  app: {
    site_name_fa: "علی زمانی",
    title_fa: "علی زمانی",
    description_fa: "توسعه دهنده متن باز",
    site_name_en: "Ali Zemani",
    title_en: "Ali Zemani",
    description_en: "OpenSourceWebDeveloper",
    footer_fa: "همه چیز به شکل شگفت انگیزی خوب باید باشد",
    footer_en: "Everything must be wonderful in every shape and form ",
  },
  cats: ["books", "notes", "projects", "tuts"],
});
