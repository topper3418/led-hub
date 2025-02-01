export const formatDateString = (dateTimeString: string, includeDay: boolean = true) => {
  // Convert string to Date object
  const date = new Date(dateTimeString);

  // Format date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Return a concise date/time string
  if (includeDay) {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } else return `${hours}:${minutes}:${seconds}`;
};
