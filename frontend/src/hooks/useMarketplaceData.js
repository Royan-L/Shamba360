import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { demoSummary } from "../data/demoData";

const STORAGE_KEY = "shamba360-marketplace";
const STORAGE_VERSION = 3;

function readStoredMarketplace() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed?.version === STORAGE_VERSION ? parsed.data : null;
  } catch {
    return null;
  }
}

function buildInitialState(baseData = demoSummary) {
  const stored = readStoredMarketplace();
  return {
    farms: stored?.farms?.length ? stored.farms : baseData.farms || [],
    inventory: stored?.inventory?.length ? stored.inventory : baseData.inventory || [],
    orders: baseData.orders || [],
    feedback: stored?.feedback?.length ? stored.feedback : baseData.feedback || [],
  };
}

function useMarketplaceData(baseData = demoSummary) {
  const [marketplace, setMarketplace] = useState(() => buildInitialState(baseData));

  useEffect(() => {
    setMarketplace((current) => ({
      ...current,
      orders: baseData.orders || [],
      inventory: baseData.inventory || current.inventory,
      farms: baseData.farms || current.farms,
    }));
  }, [baseData.orders, baseData.inventory, baseData.farms]);



  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, data: marketplace }));
  }, [marketplace]);

  const addFarm = (farm) => {
    const id = Date.now();
    const newFarm = {
      ...farm,
      id,
      produce_ready_days: Number(farm.produce_ready_days || 0),
      distance_km: Number(farm.distance_km || 0),
      produce: String(farm.produce || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    setMarketplace((current) => ({
      ...current,
      farms: [newFarm, ...current.farms],
    }));

    return newFarm;
  };

  const addProduce = (item) => {
    const produce = {
      ...item,
      id: Date.now(),
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
      low_stock_threshold: Number(item.low_stock_threshold || 0),
    };

    setMarketplace((current) => ({
      ...current,
      inventory: [produce, ...current.inventory],
    }));

    return produce;
  };

  const placeOrder = async ({ item, quantity, collectionDate, customerEmail }) => {
    const orderQuantity = Number(quantity);
    const response = await api.post("/orders/create/", {
      inventoryItemId: item.id,
      quantity: orderQuantity,
      collectionDate,
      customerEmail,
    });

    const created = response.data?.order;
    const order = {
      ...created,
      farm_name: created?.farm_name || created?.farm__name || item.farm_name || "Green Valley Farm",
      quantity: Number(created?.quantity || orderQuantity),
      value: Number(created?.quantity || orderQuantity) * Number(item.unit_price || 0),
      tracking: ["Order placed", "Awaiting farm confirmation"],
    };

    setMarketplace((current) => ({
      ...current,
      inventory: current.inventory.map((produce) =>
        produce.id === item.id
          ? { ...produce, quantity: Math.max(Number(produce.quantity || 0) - orderQuantity, 0) }
          : produce
      ),
      orders: [order, ...current.orders],
    }));

    return order;
  };

  const addFeedback = ({ order, rating, comment }) => {
    const feedback = {
      reference_code: order.reference_code,
      customer_name: order.customer__email,
      rating: Number(rating),
      comment,
      produce_type: order.inventory_item__produce_type,
    };

    setMarketplace((current) => ({
      ...current,
      feedback: [feedback, ...current.feedback.filter((item) => item.reference_code !== order.reference_code)],
    }));

    return feedback;
  };

  const updateOrderStatus = ({ referenceCode, status, trackingStep }) => {
    setMarketplace((current) => ({
      ...current,
      orders: current.orders.map((order) => {
        if (order.reference_code !== referenceCode) {
          return order;
        }

        const tracking = order.tracking || ["Order placed"];
        const nextTracking = trackingStep && !tracking.includes(trackingStep)
          ? [...tracking, trackingStep]
          : tracking;

        return {
          ...order,
          status,
          tracking: nextTracking,
        };
      }),
    }));
  };

  const customerOrders = useMemo(
    () => (email) => marketplace.orders.filter((order) => order.customer__email === email),
    [marketplace.orders]
  );

  return {
    ...marketplace,
    addFarm,
    addProduce,
    placeOrder,
    addFeedback,
    updateOrderStatus,
    customerOrders,
  };
}

export default useMarketplaceData;
