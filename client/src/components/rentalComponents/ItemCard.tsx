import { useState } from "react";
import RentalModal from "./RentalModal";

interface GearProps {
    image: string;
    name: string;
    id: string;
    basePrice: number; // price per day
  }
  
  
  interface ItemCardProps {
    gearList: GearProps[];
  }
  
  const ItemCard = ({ gearList }: ItemCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGear, setSelectedGear] = useState<GearProps | null>(null);
  
    const handleRentClick = (gear: GearProps) => {
      setSelectedGear(gear);
      setIsModalOpen(true);
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setSelectedGear(null);
    };
  
    // Define rental durations
    const rentalOptions = [1, 3,7, 10, 15];
  
    return (
      <>
        {/* Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 px-8 py-5">
          {gearList.map((gear) => (
            <div
              key={gear.id}
              className="flex flex-col items-center bg-gray-50 border rounded-lg shadow-sm hover:shadow-md transition p-4"
            >
              <img
                src={gear.image}
                alt={gear.name}
                className="w-32 h-32 object-cover mb-4 rounded-md"
              />
              <h3 className="text-base font-medium text-gray-800 mb-2">{gear.name}</h3>
              <button
                onClick={() => handleRentClick(gear)}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition"
              >
                Rent
              </button>
            </div>
          ))}
        </div>
  
        {/* Modal */}
        <RentalModal 
  isModalOpen={isModalOpen} 
  selectedGear={selectedGear} 
  closeModal={closeModal}
/>

  
      </>
    );
  };
export default ItemCard  