import { useEffect } from "react";
import { useLocation } from "react-router";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};
let previousPage = "";
export const Analytics = () => {
  const location = useLocation();
  useEffect(() => {
    const window = globalThis.window as AnalyticsWindow;
    const id = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    if (!id || !/^G-[A-Z0-9]+$/.test(id)) return;
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: unknown[]) => {
        window.dataLayer!.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", id, { send_page_view: false });
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.append(script);
    }
    const page = location.pathname + location.search;
    if (previousPage !== page) {
      window.gtag("event", "page_view", {
        page_location: window.location.href,
        page_title: document.title,
      });
      previousPage = page;
    }
  }, [location.pathname, location.search]);
  return null;
};
