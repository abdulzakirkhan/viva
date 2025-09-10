export function getDateNDaysAgo(days = 7) {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() - days); // go back N days
  // Always normalize to 00:00:00 UTC
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0)
  ).toISOString();
}

export function getCurrentDate() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  ).toISOString();
}



// utils/date.js
export const toUtcFormat = (dateStr) => {
   if (!dateStr) return null;
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0))
    .toISOString();
};



export const toUtcEndOfDay = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999); // force end of day UTC
  return d.toISOString();
};

export const toUtcStartOfDay = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0); // start of day UTC
  return d.toISOString();
};