import { Outlet, useNavigation } from "react-router";
import { SiteHeader } from "~/components/site-header";
import { NavigationProgress } from "~/components/navigation-progress";
import { Breadcrumbs } from "~/components/breadcrumbs";
import type { BreadcrumbHandle } from "~/components/breadcrumbs";

export const handle = {
  breadcrumbs: () => [{ label: "ホーム", to: "/" }],
} satisfies BreadcrumbHandle;

const SiteLayout = () => {
  const isNavigating = useNavigation().state !== "idle";
  return (
    <>
      <a href="#main" className="skip-link">
        本文へ移動
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="min-h-[70vh]">
        <Breadcrumbs />
        <div aria-busy={isNavigating}>
          <Outlet />
        </div>
      </main>
      <NavigationProgress isNavigating={isNavigating} />
    </>
  );
};
export default SiteLayout;
