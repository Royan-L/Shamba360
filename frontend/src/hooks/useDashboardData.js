import { useEffect, useState } from "react";
import api from "../services/api";
import { demoSummary } from "../data/demoData";

function enrichInventory(items = []) {
  return items.map((item, index) => {
    const demoMatch = demoSummary.inventory.find((demo) => demo.produce_type === item.produce_type);
    return {
      ...demoMatch,
      ...item,
      farm_name: item.farm_name || item.farm__name || demoMatch?.farm_name || "Green Valley Farm",
      grade: item.grade || demoMatch?.grade || "Standard",
      location: item.location || demoMatch?.location || "Store",
      ready_since: item.ready_since || demoMatch?.ready_since || new Date().toISOString().slice(0, 10),
      health_status: item.health_status || demoMatch?.health_status || "Good",
      shelf_life_days: item.shelf_life_days || demoMatch?.shelf_life_days || (index % 3 === 0 ? 7 : 30),
      perishability: item.perishability || demoMatch?.perishability || (index % 3 === 0 ? "High" : "Low"),
      market_demand: item.market_demand || demoMatch?.market_demand || "Medium",
      handling_priority: item.handling_priority || demoMatch?.handling_priority || (index % 3 === 0 ? "Urgent" : "Normal"),
      storage_tip: item.storage_tip || demoMatch?.storage_tip || "Keep produce sorted, dry, and inspected before dispatch.",
    };
  });
}

function normalizeDashboardData(apiData) {
  return {
    ...demoSummary,
    ...apiData,
    farms: apiData.farms?.length ? apiData.farms : demoSummary.farms,
    inventory: enrichInventory(apiData.inventory?.length ? apiData.inventory : demoSummary.inventory),
    operatorTips: apiData.operatorTips || demoSummary.operatorTips,
    marketInsights: apiData.marketInsights || demoSummary.marketInsights,
    feedback: apiData.feedback || demoSummary.feedback,
  };
}

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
          setData(normalizeDashboardData(response.data));
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
