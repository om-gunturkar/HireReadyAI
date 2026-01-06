import axios from "axios";

export const saveResume = (data) => {
  return axios.post("http://localhost:5000/api/resume/save", data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

export const getResume = () => {
  return axios.get("http://localhost:5000/api/resume/get", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};
