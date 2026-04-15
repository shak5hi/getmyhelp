/* PRODUCTION ARCHITECTURE UPGRADE — backward-compat redirect */
import { Redirect } from "expo-router";

/**
 * Old /profile route — redirects to the Profile tab.
 * Preserved so any existing links or history entries still work.
 */
export default function ProfileRedirect() {
  return <Redirect href="/(tabs)/profile" />;
}
/* END PRODUCTION ARCHITECTURE UPGRADE */
