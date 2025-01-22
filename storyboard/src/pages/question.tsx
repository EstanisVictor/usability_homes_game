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
    const [timeLeft, setTimeLeft] = useState<number>(30);
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

                if (answeredQuestions.length === 0) {
                    randomProblem = empresaProblemas[Math.floor(Math.random() * empresaProblemas.length)];
                    setQuestion(randomProblem);
                } else {
                    let verify = false;

                    while (!verify) {
                        randomProblem = empresaProblemas[Math.floor(Math.random() * empresaProblemas.length)];

                        const isAnswered = answeredQuestions.flatMap((aq) => aq.problems)
                            .some((p) => p.id === randomProblem.id);

                        if (!isAnswered) {
                            setQuestion(randomProblem);
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
                setTimeout(() => router.push("/game"), 3000);
            } else {
                handleSubmit();
            }
        }
    }, [timeLeft, selectedOption]);

    const handleSubmit = () => {
        if (question && companyId) {
            const isAnswerCorrect = selectedOption === question.options.indexOf(question.answer);

            if (selectedOption === null) {
                toast.error("Você não escolheu nenhuma opção.");
                setTimeout(() => router.push("/game"), 3000);
            }

            if (isAnswerCorrect) {
                addCorrectAnswer(Number(companyId), question);
                setIsCorrect(true);
                toast.success("Resposta correta!");
            } else {
                addWrongAnswer(Number(companyId), question);
                setIsCorrect(false);
                toast.error("Resposta errada!");
            }

            setCompanyQuestions((prev) => prev.filter((q) => q !== question));

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
            <div className="h-screen flex items-center justify-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white">
                <p className="text-lg">Carregando problema...</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-green-700 to-blue-600 text-white flex flex-col p-6 relative">
            <div className="absolute top-4 left-4">
                <div className="relative w-24 h-24">
                    <svg className="w-full h-full">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            stroke="white"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            stroke="red"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray="282.743"
                            strokeDashoffset={`${((30 - timeLeft) / 30) * 282.743}`}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                        {timeLeft}s
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center space-y-6">
                <ToastContainer className="toast-container" />
                <img
                    src={question.imageQuestion}
                    alt="Problema"
                    className="w-full sm:w-3/5 h-auto rounded-lg shadow-md"
                />
                <div className="w-3/5 text-justify bg-black p-6 border rounded-xl">
                    <p className="font-semibold">{question.description}</p>
                </div>
                <div className="w-full sm:w-3/5 flex flex-col gap-3">
                    {question.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSelectedOption(index);
                                setNoSelectionMessage(null);
                            }}
                            className={`w-full px-6 py-3 rounded-lg font-semibold text-lg transition duration-200 ${selectedOption === index
                                ? "bg-blue-600 text-white"
                                : "bg-white text-blue-600 border-2 border-blue-600"
                                } hover:bg-blue-700 hover:text-white`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleSubmit}
                    className={`mt-6 px-8 py-4 rounded-lg font-semibold text-lg transition duration-200 ${isSubmitting
                        ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                    disabled={isSubmitting}
                >
                    Confirmar
                </button>
            </div>
        </div>
    );
}
