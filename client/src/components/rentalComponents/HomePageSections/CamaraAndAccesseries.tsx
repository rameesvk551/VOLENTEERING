import ItemCard from "@/components/rentalComponents/ItemCard";
import { gearList } from "@/utils/dummyData";

const CamaraAndAccesries = () => {
    return (
      <section className="py-3 bg-gray-100 text-center">
        <h2 className="text-3xl font-semibold mb-2">Camara & Accessries</h2>
        <ItemCard gearList={gearList} />
  
  
      </section>
    );
  };
  

  export default CamaraAndAccesries