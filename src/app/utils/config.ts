import { unstable_noStore as noStore } from "next/cache";

export const fetchEnvVars = () => {
  noStore();
  return {
    envRedirectUri: process.env["NEXT_PUBLIC_REDIRECT_URI"],
  };
};
