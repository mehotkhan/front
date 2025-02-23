export default defineAppConfig({
  mainMenu: [
    [
      {
        label: "Home",
        // icon: "i-lucide-home",
        to: "/",
      },
      {
        label: "Explorer",
        // icon: "i-lucide-search",
        to: "/explorer",
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
    [
      {
        label: "Manage",
        slot: "manage",
      },
      {
        label: "i18n",
        slot: "i18n",
      },
      {
        label: "theme",
        slot: "theme",
      },

      {
        label: "avatar",
        slot: "avatar",
      },
    ],
  ],
  dashMenu: [
    [
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
        defaultOpen: true,
        to: "/manage/items",
      },
      // {
      //   label: "Comments",
      //   // icon: "i-lucide-database",
      //   to: "/manage/comments",
      // },
      {
        label: "Users",
        // icon: "i-lucide-box",
        to: "/manage/users",
        defaultOpen: true,
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
    [
      {
        label: "Manage",
        slot: "manage",
      },
      {
        label: "Help",
        // icon: "i-lucide-circle-help",
        // disabled: true,
      },
      {
        label: "i18n",
        slot: "i18n",
      },

      {
        label: "theme",
        slot: "theme",
      },

      {
        label: "avatar",
        slot: "avatar",
      },
    ],
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
    site_name_fa: "مَموچی",
    title_fa: "مَـ موچیــ",
    description_fa: "کوچولو و بازیگوش",
    site_name_en: "Mamoochi",
    title_en: "Ma moochi",
    description_en: "Tiny & Playful",
  },
});
