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
            <div className="h-screen bg-gradient-to-r from-blue-700 to-green-800 flex flex-col items-center justify-center gap-4 p-4">
                <h2 className="text-2xl font-bold">Jogo Finalizado</h2>
                <p className="text-black font-bold">Total de Questões: {totalQuestions}</p>
                <p className="text-green-500 font-bold">Acertos: {totalCorrect} ({correctPercentage.toFixed(2)}%)</p>
                <p className="text-red-500 font-bold">Erros: {totalWrong} ({wrongPercentage.toFixed(2)}%)</p>
                <button
                    onClick={handleResetGame}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700"
                >
                    Reiniciar Jogo
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-r from-blue-700 to-green-800 flex flex-col items-center gap-6 p-6">
            <button
                onClick={handleResetGame}
                className="px-8 py-3 bg-purple-600 text-white font-bold rounded-md hover:bg-purple-700 transition duration-300"
            >
                Reiniciar Jogo
            </button>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
                {companies.map((company) => {
                    const stats = getQuestionStats(company.id);

                    return (
                        <div
                            key={company.id}
                            onClick={() => handleCompanyClick(company.id)}
                            className={`w-56 h-56 border-4 rounded-xl flex flex-col justify-center items-center cursor-pointer transition-all 
                            ${disabledCompanies.includes(company.id)
                                    ? "border-gray-500 opacity-50 cursor-not-allowed"
                                    : alertCompany === company.id
                                        ? "border-red-600 animate-bounce"
                                        : "border-transparent hover:border-white"
                                }`}
                        >
                            <img
                                src={company.image}
                                alt={company.name}
                                className="w-24 h-24 mb-3 rounded-full shadow-lg transform transition duration-300 hover:scale-110"
                            />
                            <span className="text-xl font-semibold text-white">{company.name}</span>
                            <span className="text-sm text-white mt-2">
                                {stats.answered}/{stats.total} questões
                            </span>
                            <span className="text-xs text-green-500 font-bold">Acertos: {stats.correct}</span>
                            <span className="text-xs text-red-500 font-bold">Erros: {stats.wrong}</span>
                        </div>
                    );
                })}
            </div>
            <ToastContainer />
        </div>
    );
}
