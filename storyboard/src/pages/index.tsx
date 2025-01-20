import { useRouter } from "next/router";

export default function Home() {

  const router = useRouter();

  const startGame = () => {
    router.push("/game");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center  bg-gradient-to-r from-green-700 to-blue-800 p-6">
      <h1 className="text-4xl font-bold text-white mb-6">Usability Homes</h1>
      <p className="text-lg text-gray-300 mb-4 text-center">
        Bem-vindo ao jogo! Você é o Super Detetive da Usabilidade. Seu objetivo é identificar e resolver problemas de usabilidade em empresas.
      </p>
      <button
        onClick={startGame}
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
      >
        Iniciar Jogo
        <img src="./play-button.png" className="w-6 h-6 ml-2" alt="Ícone de Play"/>
      </button>
    </div>
  );
}
