import { useState } from "react";

interface ModalProps {
  title: string;
  body: string;
  buttonLabel: string;
  input?: string;
  setState: () => void;
  setInput?: (val: string) => void;
}

const Modal: React.FC<ModalProps> = ({title, body, buttonLabel, input, setState, setInput}) => {
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleClick = () => {
    if (input) {
      if (input.length === 0) {
        setState();
        return;
      }
      if (input.length < 3) {
        setErrorMsg("Nickname must be at least 3 characters long.");
        return;
      }
    }
    setState();
  }

  return (
    <div className="fixed inset-0 backdrop-opacity-80 font-sans overflow-y-auto h-full w-full flex items-center justify-center z-100">
      <div className="p-8 w-96 shadow-xl rounded-md bg-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-lg text-gray-500">{body}</p>
          </div>
          {(input === "" || input) && (
            <input 
              type="text" 
              placeholder="Enter your nickname (optional)" 
              className="w-full py-1 outline-1 outline-gray-400 focus:outline-1 focus:outline-blue-500 rounded-md text-center text-black"
              onChange={(e) => setInput && setInput(e.target.value)}
              maxLength={20}
            />
          )}
          <div className="flex flex-col justify-center mt-4 items-center">
            {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}
            <button
              onClick={() => handleClick()}
              className="px-4 hover:cursor-pointer py-2 w-fit bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;