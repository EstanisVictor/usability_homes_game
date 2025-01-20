import { IProblem } from "./IProblems";

export interface ICompany { 
    id: number;
    name: string;
    problems: IProblem[];
    image: string;
};