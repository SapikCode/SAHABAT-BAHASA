import { TolakiCultureDetail } from "@/components/culture/TolakiCultureDetail";

type BudayaTolakiDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BudayaTolakiDetailPage({
  params,
}: BudayaTolakiDetailPageProps) {
  const { slug } = await params;

  return <TolakiCultureDetail slug={slug} />;
}
