import axios from "axios";

type fetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
};

export async function fetch<T>(
  endpoint: string,
  options: fetchOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const defaultHeaders = {
    "content-type": "application/json",
    ...headers,
  };
  const response = await axios({
    method: method,
    url: `/api${endpoint}`,
    headers: defaultHeaders,
    data: body ,
  });
  
  return response.data;
}
