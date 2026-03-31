import React from "react";

interface AboutUsModalProps {
  open: boolean;
  onClose: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-10 relative flex flex-col items-center">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-3xl font-bold mb-6 text-primary self-start">Meet the Team</h2>
        <div className="flex flex-wrap justify-center gap-8 w-full mb-8">
          <div className="flex flex-col items-center w-40">
            <img
              src="/images/Christoper.jpg"
              alt="Christopher Colomer"
              className="w-50 h-40 rounded-lg object-cover mb-2 border border-gray-200"
            />
            <span className="font-semibold text-center">Christopher Colomer</span>
            <span className="text-xs text-gray-500 text-center">Ultimate Developer</span>
          </div>
          <div className="flex flex-col items-center w-40">
            <img
              src="/images/Nikko.jpg"
              alt="Nikko Delos santos"
              className="w-50 h-40 rounded-lg object-cover mb-2 border border-gray-200"
            />
            <span className="font-semibold text-center">Nikko Delos santos</span>
            <span className="text-xs text-gray-500 text-center">Backend Developer</span>
          </div>
          <div className="flex flex-col items-center w-40">
            <img
              src="/images/reinwel.jpg"
              alt="Reinwel Tingson"
              className="w-50 h-40 rounded-lg object-cover mb-2 border border-gray-200"
            />
            <span className="font-semibold text-center">Reinwel Tingson</span>
            <span className="text-xs text-gray-500 text-center">Front End Developer</span>
          </div>
          <div className="flex flex-col items-center w-40">
            <img
              src="/images/trisha.jpg"
              alt="Trisha Jambaro"
              className="w-50 h-40 rounded-lg object-cover mb-2 border border-gray-200"
            />
            <span className="font-semibold text-center">Trisha Jambaro</span>
            <span className="text-xs text-gray-500 text-center">Project Manager</span>
          </div>
        </div>
        <div className="w-full max-w-2xl">
          <h3 className="text-xl font-semibold mb-2">Why we made this web app:</h3>
          <p className="text-gray-700 text-center">
            We created iLOcate to help locals and tourists discover the best places, food, and events in Iloilo City. Our goal is to make exploring Iloilo easy, fun, and accessible for everyone by providing a user-friendly platform with up-to-date information and personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};
