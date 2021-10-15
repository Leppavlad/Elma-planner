export const fetchData = async (url: string) => {
  const response = await fetch(url);
  const responseData = await response.json();
  return responseData;
};
