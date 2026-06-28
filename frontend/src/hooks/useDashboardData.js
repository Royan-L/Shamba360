import { useEffect, useState } from "react";
import api from "../services/api";
import { demoSummary } from "../data/demoData";

function useDashboardData() {
  const [data, setData] = useState(demoSummary);
  const [loading, setLoading] = useState(true);
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    let mounted = true;

    api
      .get("/dashboard/")
      .then((response) => {
        if (mounted) {
          setData({ ...demoSummary, ...response.data });
          setUsingDemoData(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setData(demoSummary);
          setUsingDemoData(true);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, usingDemoData };
}

export default useDashboardData;
