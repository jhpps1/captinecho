interface InfoCardProps {
  title: string;
  description: string;
}

const InfoCard = ({ title, description }: InfoCardProps) => {
  return (
    <div
      className="flex items-center w-full 
                 bg-white bg-opacity-80 backdrop-blur-sm 
                 border border-blue-300 
                 rounded-full shadow-md"
    >
      <div className="bg-blue-400 rounded-full py-3 px-6 m-2">
        <span className="text-white font-bold font-peach text-lg whitespace-nowrap">
          {title}
        </span>
      </div>

      <p className="text-gray-700 text-lg font-peach font-medium pl-2 pr-6">
        {description}
      </p>
    </div>
  );
};

export default InfoCard;