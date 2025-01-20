import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ICompanyProblems, IProblem } from "@/Interfaces";
import useProblems from "@/hooks/useProblems";
import {
    addCorrectAnswer,
    addWrongAnswer,
    getCorrectAnswers,
    getWrongAnswers,
} from "@/data/scoreStore";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export default function Question() {
    const router = useRouter();
    const { companyId } = router.query;

    const problems: ICompanyProblems[] = useProblems();

    const [question, setQuestion] = useState<IProblem | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(30000);
    const [noSelectionMessage, setNoSelectionMessage] = useState<string | null>(null);
    const [companyQuestions, setCompanyQuestions] = useState<IProblem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (companyId && problems.length > 0) {
            const empresaProblemas = problems.find(
                (p) => p.id === Number(companyId)
            )?.problems;
            if (empresaProblemas) {
                setCompanyQuestions(empresaProblemas);

                const answeredQuestions = [
                    ...getCorrectAnswers(),
                    ...getWrongAnswers()
                ];

                let randomProblem: IProblem;
                console.log("Problemas respondidos: ", answeredQuestions);

                if (answeredQuestions.length === 0) {
                    randomProblem = empresaProblemas[Math.floor(Math.random() * empresaProblemas.length)];
                    console.log("Problema aleatório: ", randomProblem);
                    setQuestion(randomProblem);
                } else {
                    console.log("Verificando se o problema já foi respondido");

                    let verify = false;

                    while (!verify) {
                        randomProblem = empresaProblemas[Math.floor(Math.random() * empresaProblemas.length)];

                        // Verifica se o problema foi respondido
                        const isAnswered = answeredQuestions.flatMap((aq) => aq.problems)
                            .some((p) => p.id === randomProblem.id);

                        if (isAnswered) {
                            console.log("Problema já respondido, tentando novamente: ", randomProblem);
                            verify = false;
                        } else {
                            setQuestion(randomProblem);
                            console.log("Problema não respondido: ", randomProblem);
                            verify = true;
                        }
                    }
                }
            }
        }
    }, [companyId, problems]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            if (selectedOption === null) {
                toast.error("O tempo acabou e você não escolheu nenhuma opção.");
            } else {
                handleSubmit();
            }
        }
    }, [timeLeft, selectedOption]);

    const handleSubmit = () => {
        if (selectedOption === null) {
            toast.error("Você não escolheu nenhuma opção.");
            return;
        }

        if (question && companyId) {
            const isAnswerCorrect = selectedOption === question.options.indexOf(question.answer);

            if (isAnswerCorrect) {
                addCorrectAnswer(Number(companyId), question);
                setIsCorrect(true);
                toast.success("Resposta correta!");
            } else {
                addWrongAnswer(Number(companyId), question);
                setIsCorrect(false);
                toast.error("Resposta errada!");
            }

            setCompanyQuestions((prev) =>
                prev.filter((q) => q !== question)
            );

            if (companyQuestions.length <= 1) {
                toast.info(
                    "Todas as questões dessa empresa foram respondidas. Você será redirecionado."
                );
                setTimeout(() => router.push("/game"), 3000);
            }
        }

        setIsSubmitting(true);

        setTimeout(() => {
            toast.info("Você será redirecionado.");
        }, 1000);

        setTimeout(() => router.push("/game"), 3000);
    };

    if (!question) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p>Carregando problema...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-100 flex flex-col p-4">
            <p className="mt-4 text-xl text-gray-700">
                Tempo restante: {Math.floor(timeLeft)} segundos
            </p>
            <div className="h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
                <ToastContainer
                    className="toast-container"
                    position="top-center"
                />

                <img
                    src={question.image || "/default-problem.png"}
                    alt="Problema"
                    className="w-96 h-auto mb-4"
                />
                <h1 className="text-3xl font-bold mb-2">
                    {question.description}
                </h1>
                <div className="flex flex-col gap-2">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSelectedOption(index);
                                setNoSelectionMessage(null);
                            }}
                            className={`px-4 py-2 rounded-md border ${selectedOption === index
                                ? "bg-blue-500 text-white"
                                : "bg-white"
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleSubmit}
                    className={`mt-4 px-6 py-3 rounded-md ${isSubmitting
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                    disabled={isSubmitting}
                >
                    Confirmar
                </button>
            </div>
        </div>
    );
}
