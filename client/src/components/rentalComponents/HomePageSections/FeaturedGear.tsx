import ItemCard from "@/components/rentalComponents/ItemCard";
import { gearList } from "@/utils/dummyData";

const FeaturedGear = () => {
  return (
    <section className="py-3 bg-gray-100 text-center">
      <h2 className="text-3xl font-semibold mb-6">New Arrivals</h2>
      <ItemCard gearList={gearList} />


    </section>
  );
};

export default FeaturedGear