import ItemCard from "@/components/rentalComponents/ItemCard";
import { gearList } from "@/utils/dummyData";

const CampingGears = () => {
    return (
      <section className="py-3 bg-gray-100 text-center">
        <h2 className="text-3xl font-semibold mb-6">Top Offers</h2>
        <ItemCard gearList={gearList} />
      </section>
    );
  };

  export default CampingGears