import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ICompany } from "@/Interfaces";
import useProblems from "@/hooks/useProblems";
import { getCorrectAnswers, getWrongAnswers, resetGame } from "@/data/scoreStore";

export default function Game() {
    const [alertCompany, setAlertCompany] = useState<number | null>(null);
    const [disabledCompanies, setDisabledCompanies] = useState<number[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [totalCorrect, setTotalCorrect] = useState(0);
    const [totalWrong, setTotalWrong] = useState(0);
    const [correctPercentage, setCorrectPercentage] = useState(0);
    const [wrongPercentage, setWrongPercentage] = useState(0);

    const router = useRouter();
    const companies: ICompany[] = useProblems();

    useEffect(() => {
        if (companies.length > 0) {
            const total = companies.flatMap((c) => c.problems).length;
            setTotalQuestions(total);

            const correctAnswersCount = getCorrectAnswers().flatMap((q) => q.problems).length;
            const wrongAnswersCount = getWrongAnswers().flatMap((q) => q.problems).length;

            setTotalCorrect(correctAnswersCount);
            setTotalWrong(wrongAnswersCount);

            if (correctAnswersCount + wrongAnswersCount > 0) {
                const correctPercentage = (correctAnswersCount / total) * 100;
                const wrongPercentage = (wrongAnswersCount / total) * 100;

                setCorrectPercentage(correctPercentage);
                setWrongPercentage(wrongPercentage);
            }

            if (correctAnswersCount + wrongAnswersCount === total) {
                setIsGameOver(true);
            } else {
                setIsGameOver(false);
            }
        } else {
            console.log("Empresas não carregadas");
            setIsGameOver(false);
        }
    }, [companies]);

    useEffect(() => {

        const getRandomCompany = () => {
            const availableCompanies = companies.filter(
                (company) => !disabledCompanies.includes(company.id)
            );

            if (availableCompanies.length === 0) {
                setIsGameOver(true);
                return null;
            }

            const randomCompany = availableCompanies[Math.floor(Math.random() * availableCompanies.length)];
            return randomCompany;
        };

        const randomCompany = getRandomCompany();

        if (randomCompany) {
            setAlertCompany(randomCompany.id);
        }
    }, [companies, disabledCompanies, isGameOver]);

    const checkIfCompanyAnswered = (companyId: number) => {
        const allQuestions = companies.find((company) => company.id === companyId)?.problems || [];
        const answeredQuestions = [
            ...getCorrectAnswers(),
            ...getWrongAnswers()
        ];

        const answeredQuestionIds = answeredQuestions.flatMap((q) => q.problems.map((p) => p.id));
        return allQuestions.every((question) => answeredQuestionIds.includes(question.id));
    };

    useEffect(() => {
        const newDisabledCompanies = companies.filter(
            (company) => checkIfCompanyAnswered(company.id)
        ).map((company) => company.id);

        setDisabledCompanies(newDisabledCompanies);
    }, [companies]);

    const getQuestionStats = (companyId: number) => {
        const allQuestions = companies.find((company) => company.id === companyId)?.problems || [];

        const correctAnswers = getCorrectAnswers().flatMap((q) => q.problems)
            .filter((q) => allQuestions.some((question) => question.id === q.id));

        const wrongAnswers = getWrongAnswers().flatMap((q) => q.problems)
            .filter((q) => allQuestions.some((question) => question.id === q.id));

        return {
            total: allQuestions.length,
            answered: correctAnswers.length + wrongAnswers.length,
            correct: correctAnswers.length,
            wrong: wrongAnswers.length,
        };
    };

    const handleCompanyClick = (id: number) => {
        if (disabledCompanies.includes(id)) {
            toast.warning("Todas as questões desta empresa já foram respondidas!");
        } else if (id === alertCompany) {
            router.push(`/question?companyId=${id}`);
        } else {
            toast.info("Esta empresa não tem problemas no momento!");
        }
    };

    const handleResetGame = () => {
        resetGame();
        setIsGameOver(false);
        toast.info("O jogo será reiniciado!");
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    };

    if (isGameOver) {
        return (
            <div className="h-screen bg-gray-200 flex flex-col items-center justify-center gap-4 p-4">
                <h2 className="text-2xl font-bold">Jogo Finalizado</h2>
                <p>Total de Questões: {totalQuestions}</p>
                <p>Acertos: {totalCorrect} ({correctPercentage.toFixed(2)}%)</p>
                <p>Erros: {totalWrong} ({wrongPercentage.toFixed(2)}%)</p>
                <button
                    onClick={handleResetGame}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600"
                >
                    Reiniciar Jogo
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-200 flex flex-col items-center gap-4 p-4">
            <button
                onClick={handleResetGame}
                className="mb-4 px-6 py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600"
            >
                Reiniciar Jogo
            </button>
            <div className="flex flex-wrap justify-center gap-4">
                {companies.map((company) => {
                    const stats = getQuestionStats(company.id);

                    return (
                        <div
                            key={company.id}
                            onClick={() => handleCompanyClick(company.id)}
                            className={`w-40 h-40 border-2 rounded-md flex flex-col justify-center items-center cursor-pointer 
                            ${disabledCompanies.includes(company.id)
                                    ? "border-gray-500 opacity-50 cursor-not-allowed"
                                    : alertCompany === company.id
                                        ? "border-red-500 animate-pulse"
                                        : "border-gray-500"
                                }`}
                        >
                            <img src={company.image} alt={company.name} className="w-20 h-20 mb-2" />
                            <span className="text-lg font-bold">{company.name}</span>
                            <span className="text-sm mt-1">
                                {stats.answered}/{stats.total} questões
                            </span>
                            <span className="text-xs text-green-600">Acertos: {stats.correct}</span>
                            <span className="text-xs text-red-600">Erros: {stats.wrong}</span>
                        </div>
                    );
                })}
            </div>
            <ToastContainer />
        </div>
    );
}
