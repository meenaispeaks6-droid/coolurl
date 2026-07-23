import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import { useDataProvider } from "@/lib/data-provider";
import { DetailTopBar } from "./components/detail-top-bar";
import { LinkInfoCard } from "./components/link-info-card";
import { StatCards } from "./components/stat-cards";
import { ClicksChart } from "./components/clicks-chart";
import { ReferrersChart } from "./components/referrers-chart";
import { DeviceChart } from "./components/device-chart";

export default function LinkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDemo = pathname.startsWith("/demo");

  const { useLinkById } = useDataProvider();
  const { data: link, isLoading } = useLinkById(id!);

  const handleDeleted = () => {
    navigate(isDemo ? "/demo/links" : "/links");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DetailTopBar isDemo={isDemo} />
        <div className="mx-auto w-full max-w-5xl flex-1 p-6">
          <div className="h-8 w-48 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="flex min-h-screen flex-col">
        <DetailTopBar isDemo={isDemo} />
        <div className="mx-auto w-full max-w-5xl flex-1 p-6">
          <p className="text-muted-foreground">Link not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DetailTopBar isDemo={isDemo} />
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-6">
        <Link
          to={isDemo ? "/demo/links" : "/links"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <IconArrowLeft className="size-4" />
          All links
        </Link>

        <LinkInfoCard link={link} isDemo={isDemo} onDeleted={handleDeleted} />
        <StatCards linkId={link.id} />
        <ClicksChart linkId={link.id} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ReferrersChart linkId={link.id} />
          <DeviceChart linkId={link.id} />
        </div>
      </div>
    </div>
  );
}
