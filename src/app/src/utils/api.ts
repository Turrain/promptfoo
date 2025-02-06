import useApiConfig from '@app/stores/apiConfig';

export async function callApi(path: string, options: RequestInit = {}): Promise<Response> {
  const { apiBaseUrl } = useApiConfig.getState();
  return fetch(`${apiBaseUrl}/api${path}`, options);
}

export async function fetchUserEmail(): Promise<string | null> {
  try {
    const response = await callApi('/user/email', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user email');
    }

    const data = await response.json();
    return data.email;
  } catch (error) {
    console.error('Error fetching user email:', error);
    return null;
  }
}

export async function updateEvalAuthor(evalId: string, author: string) {
  const response = await callApi(`/eval/${evalId}/author`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ author }),
  });

  if (!response.ok) {
    throw new Error('Failed to update eval author');
  }

  return response.json();
}

interface ModelDetails {
  parent_model: string;
  format: string;
  family: string;
  families: string[] | null;
  parameter_size: string;
  quantization_level: string;
}

interface Model {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: ModelDetails;
}

interface ApiResponse {
  models: Model[];
}

export async function getModelConfigs(apiUrl: string) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ApiResponse = await response.json();
    const modelConfigs = data.models.map((model: Model) => {
      const modelName = model.name.startsWith("ollama:")
        ? model.name
        : "ollama:" + model.name;
      return {
        id: modelName,
        config: {
          organization: "",
          temperature: 0.5,
          max_tokens: 1024,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
          function_call: undefined,
          functions: undefined,
          stop: undefined,
        },
      };
    });
    return modelConfigs;
  } catch (error: any) {
    console.error("Error fetching model data:", error);
    return [];
  }
}
