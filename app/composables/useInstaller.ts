const dbConnected = ref(false);
const dbMigrated = ref(false);
const dbLoaded = ref(false);
const adminLoaded = ref(false);
const currentStep = ref(0);
const isMigrating = ref(false);
const dbLoading = ref(false);

export default () => {
  const checkDbConnections = async () => {
    try {
      await $fetch("/api/install/database-connections");
      dbConnected.value = true;
    } catch (err: any) {
      dbConnected.value = false;
    }
  };
  const runMigrations = async () => {
    try {
      isMigrating.value = true;
      await $fetch("/api/install/migrations-run");
      console.log("run migrations ");
      isMigrating.value = true;
      dbMigrated.value = true;
    } catch (err: any) {
      isMigrating.value = false;
    }
  };
  const runDbLoading = async () => {
    try {
      dbLoading.value = true;
      await $fetch("/api/install/database-loading");
      dbLoading.value = true;
      dbLoaded.value = true;
    } catch (err: any) {
      dbLoading.value = false;
    }
  };

  return {
    dbConnected,
    currentStep,
    dbMigrated,
    runMigrations,
    isMigrating,
    checkDbConnections,
    dbLoaded,
    dbLoading,
    runDbLoading,
    adminLoaded,
  };
};
