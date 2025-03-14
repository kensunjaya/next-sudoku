interface ModalProps {
  title: string;
  body: string;
  buttonLabel: string;
  setState: () => void;
}

const Modal: React.FC<ModalProps> = ({title, body, buttonLabel, setState}) => {
  return (
    <div className="fixed inset-0 backdrop-opacity-80 font-sans overflow-y-auto h-full w-full flex items-center justify-center z-100">
      <div className="p-8 w-96 shadow-xl rounded-md bg-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-lg text-gray-500">{body}</p>
          </div>
          <div className="flex justify-center mt-4">
            {/* Navigates back to the base URL - closing the modal */}
            <button
              onClick={() => setState()}
              className="px-4 hover:cursor-pointer py-2 bg-blue-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
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