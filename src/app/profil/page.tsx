import type { Metadata } from "next";
import { ProfileOverview } from "@/components/profile/ProfileOverview";

export const metadata: Metadata = {
  title: "Profil Saya",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilPage() {
  return <ProfileOverview />;
}
