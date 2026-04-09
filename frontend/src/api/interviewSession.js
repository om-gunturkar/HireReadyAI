import api from "./axiosInstance";

export const startInterviewSession = async ({ mode, topic, level }) => {
  const response = await api.post("/interview/session/start", { mode, topic, level });
  return response.data;
};

export const submitInterviewAnswer = async (sessionId, { question, answer }) => {
  const response = await api.post(`/interview/session/${sessionId}/answer`, {
    question,
    answer,
  });
  return response.data;
};

export const completeInterviewSession = async (sessionId) => {
  const response = await api.post(`/interview/session/${sessionId}/complete`);
  return response.data;
};

export const getInterviewSessionReport = async (sessionId) => {
  const response = await api.get(`/interview/session/${sessionId}/report`);
  return response.data;
};
