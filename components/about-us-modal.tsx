import React from "react";

interface AboutUsModalProps {
  open: boolean;
  onClose: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ open, onClose }) => {
  const teamMembers = [
    {
      name: "Christopher Colomer",
      role: "Ultimate Developer",
      image: "/images/people/Christoper.jpg",
      alt: "Christopher Colomer",
    },
    {
      name: "Nikko Delos Santos",
      role: "Backend Developer",
      image: "/images/people/Nikko.jpg",
      alt: "Nikko Delos Santos",
    },
    {
      name: "Reinwel Tingson",
      role: "Front End Developer",
      image: "/images/people/reinwel.jpg",
      alt: "Reinwel Tingson",
    },
    {
      name: "Trisha Jambaro",
      role: "Project Manager",
      image: "/images/people/trisha.jpg",
      alt: "Trisha Jambaro",
    },
  ];

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 animate-in fade-in duration-300">
      <div className="relative flex w-full max-w-5xl max-h-[92vh] flex-col items-center overflow-y-auto rounded-2xl bg-white p-10 shadow-2xl shadow-black/20 animate-in fade-in zoom-in-95 duration-300">
        <button
          className="absolute right-3 top-3 text-gray-500 transition-colors hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="mb-8 w-full">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">The people behind iLOcate</p>
          <h2 className="text-3xl font-bold text-primary">Meet the Team</h2>
        </div>

        <section className="mb-10 w-full space-y-4">
          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={member.image}
                  alt={member.alt}
                  className="mb-4 h-40 w-full rounded-lg object-cover ring-1 ring-slate-200"
                />
                <h3 className="text-sm font-semibold text-slate-900">{member.name}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary/80">{member.role}</p>
              </article>
            ))}
          </div>
        </section>
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
