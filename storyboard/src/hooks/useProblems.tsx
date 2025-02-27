import { useState, useEffect } from "react";

export default function useProblems() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      const response = await fetch("/problemas.json");
      const data = await response.json();
      setProblems(data);
    };

    fetchProblems();
  }, []);
  return problems;
}
