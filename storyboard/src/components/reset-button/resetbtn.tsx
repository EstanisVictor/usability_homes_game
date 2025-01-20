import React from "react";
import { resetGame } from "../../data/scoreStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RestartButton = () => {
    const handleRestart = () => {
        resetGame();
        toast.info("O jogo será reiniciado", {
            position: "top-center",
            autoClose: 3000,
        });
        setTimeout(() => {
            window.location.reload();
        }, 3100);
    };

    return (
        <div>
            <button
                onClick={handleRestart}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
                Reiniciar Jogo
            </button>
            <ToastContainer />
        </div>
    );
};

export default RestartButton;
