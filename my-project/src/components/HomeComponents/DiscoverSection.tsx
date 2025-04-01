
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DiscoverSection = () => {
  const cards = [

    {
      imageSrc: "/rent.jpg",
      title: "🎭 Cultural Immersion",
      description:
        "Engage in authentic local activities, workshops, and guided tours designed to offer a deeper connection to the destination.",
    },

    {
      imageSrc:"rent.jpg", // Add thi
      title: "🗺️ Tailored Adventures",
      description:
        "Find customized tours and off-the-beaten-path experiences curated to match your travel style.",
    },
    {
      imageSrc: "../../../public/rent.jpg", // Add this
      title: "🎒 Smart Gear Rentals",
      description:
        "Travel light by renting high-quality travel gear, outdoor equipment, and essentials at your destination.",
    },
  ]
  

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.8 }}
      variants={containerVariants}
      className="py-12 bg-white mb-16"
    >
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
        <motion.div variants={itemVariants} className="my-12 text-center">
          <h2 className="text-3xl font-semibold leading-tight text-gray-800">
            Mission
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Discover, plan, and embark on unforgettable journeys.
          </p>
          <p className="mt-2 text-gray-500 max-w-3xl mx-auto">
            Our goal is to make travel seamless, meaningful, and accessible for
            everyone. Whether you’re searching for adventure, cultural
            immersion, or a way to give back, we’ve got you covered.
          </p>
        </motion.div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16 text-center">
          {cards.map((card, index) => {
            console.log(`Rendering card ${index + 1}:`, card); // Debugging
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="w-full block"
              >
                <DiscoverCard {...card} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

const DiscoverCard = ({
  imageSrc,
  title,
  description,
}: {
  imageSrc: string;
  title: string;
  description: string;
}) => (
  <div className=" shadow-lg rounded-lg bg-primary-50 md:h-83 ">
      <img
        src={imageSrc}
        width={30}
        height={30}
        className="w-full h-58"
        alt={title}
      />
    <div className="bg-primary-700 p-[0.6rem] rounded-full mb-4 h-10 w-10 mx-auto">
    
    </div>
    <h3 className="mt-4 text-xl font-medium text-gray-800">{title}</h3>
    <p className="mt-2 text-base text-gray-500">{description}</p>
  </div>
);

export default DiscoverSection;
