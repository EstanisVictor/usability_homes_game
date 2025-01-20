import { ICompanyProblems, IProblem } from "../Interfaces";

const LOCAL_STORAGE_KEYS = {
    correctAnswers: "correctAnswers",
    wrongAnswers: "wrongAnswers",
};

const getStoredCompanyProblems = (key: string): ICompanyProblems[] => {
    return JSON.parse(localStorage.getItem(key) || "[]");
};

const saveCompanyProblems = (key: string, data: ICompanyProblems[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const addCorrectAnswer = (companyId: number, question: IProblem) => {
    const storedAnswers: ICompanyProblems[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEYS.correctAnswers) || "[]"
    );
    const storedWrongAnswers: ICompanyProblems[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEYS.wrongAnswers) || "[]"
    );

    const isAnswered =
        storedAnswers.some((c) => c.id === companyId && c.problems.some((p) => p.id === question.id)) ||
        storedWrongAnswers.some((c) => c.id === companyId && c.problems.some((p) => p.id === question.id));

    if (isAnswered) {
        return;
    }

    const companyIndex = storedAnswers.findIndex((c) => c.id === companyId);

    if (companyIndex !== -1) {
        storedAnswers[companyIndex].problems.push(question);
    } else {
        storedAnswers.push({ id: companyId, problems: [question] });
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.correctAnswers, JSON.stringify(storedAnswers));
};


export const addWrongAnswer = (companyId: number, question: IProblem) => {
    const storedAnswers: ICompanyProblems[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEYS.correctAnswers) || "[]"
    );
    const storedWrongAnswers: ICompanyProblems[] = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_KEYS.wrongAnswers) || "[]"
    );

    const isAnswered =
        storedAnswers.some((c) => c.id === companyId && c.problems.some((p) => p.id === question.id)) ||
        storedWrongAnswers.some((c) => c.id === companyId && c.problems.some((p) => p.id === question.id));

    if (isAnswered) {
        return;
    }

    const companyIndex = storedWrongAnswers.findIndex((c) => c.id === companyId);

    if (companyIndex !== -1) {
        storedWrongAnswers[companyIndex].problems.push(question);
    } else {
        storedWrongAnswers.push({ id: companyId, problems: [question] });
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.wrongAnswers, JSON.stringify(storedWrongAnswers));
};


export const getCorrectAnswers = (): ICompanyProblems[] => {
    return getStoredCompanyProblems(LOCAL_STORAGE_KEYS.correctAnswers);
};

export const getWrongAnswers = (): ICompanyProblems[] => {
    return getStoredCompanyProblems(LOCAL_STORAGE_KEYS.wrongAnswers);
};

export const resetGame = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.correctAnswers);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.wrongAnswers);
};

export const markQuestionAsAnswered = (companyId: number, question: IProblem) => {
    const notAnswered: ICompanyProblems[] = JSON.parse(
        localStorage.getItem("notAnswered") || "[]"
    );

    const companyIndex = notAnswered.findIndex((c) => c.id === companyId);

    if (companyIndex !== -1) {
        const questionIndex = notAnswered[companyIndex].problems.findIndex(
            (p) => p.id === question.id
        );

        if (questionIndex !== -1) {
            notAnswered[companyIndex].problems.splice(questionIndex, 1);
            localStorage.setItem("notAnswered", JSON.stringify(notAnswered));
        }
    }
};

