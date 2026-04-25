const pad = (value: number) => String(value).padStart(2, "0");

export const getLocalDateString = (date = new Date()) => {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().split("T")[0];
};

export const getMinDeliveryTime = (deliveryDate: string) => {
  if (!deliveryDate || deliveryDate !== getLocalDateString()) return "00:00";

  const minDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
  if (getLocalDateString(minDate) !== deliveryDate) return "23:59";

  return `${pad(minDate.getHours())}:${pad(minDate.getMinutes())}`;
};

export const isDeliveryTimeAllowed = (deliveryDate: string, deliveryTime: string) => {
  if (!deliveryDate || !deliveryTime) return false;
  if (deliveryDate > getLocalDateString()) return true;
  if (deliveryDate < getLocalDateString()) return false;
  if (getLocalDateString(new Date(Date.now() + 2 * 60 * 60 * 1000)) !== deliveryDate) return false;
  return deliveryTime >= getMinDeliveryTime(deliveryDate);
};
