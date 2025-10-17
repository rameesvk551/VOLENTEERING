import React, { useState } from "react";
import Logo from "../Logo";
import { Toaster } from "sonner";
import Divider from "../Divider";
import { useForm } from "react-hook-form";
import PlacesAutocomplete from "../placeAutoCompleteAndMap/PlaceAutoComplete";
import { AppDispatch } from "../../redux/store";
import { useDispatch } from "react-redux";
import { nextStep, prevStep, updateAddress } from "../../redux/Slices/hostFormSlice";
import PlacesAutocompleteForHost from "../placeAutoCompleteAndMap/PlaeAutocompleteForHost";
type AddressValues = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
  class: string;
  type: string;
  importance: number;
  name: string;
  osm_id: number;
  osm_type: string;
  place_rank: number;
  addresstype: string;
  licence: string;
};
const Address= () => {
  const dispatch=useDispatch<AppDispatch>()
  const [selectedAddress, setSelectedAddress] = useState<AddressValues | null>(null);


  const handleAddressSelect = (place: AddressValues) => {
    console.log("Selected place in parent:", place);
    setSelectedAddress(place);
  
     dispatch(updateAddress(place));
  };


  return (
    <div className="flex w-full h-[100vh]">
      {/* LEFT */}
      <div className='hidden md:flex flex-col gap-y-5 w-1/3 h-full bg-black items-center justify-center px-8 text-center'>
  <h5 className="text-3xl font-bold tracking-wide text-gray-900 uppercase">
    <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text">RAIH</span>
  </h5>
  <p className='text-lg font-medium text-white'>
    Ready to share your space?<br />
    Become a <span className="text-yellow-400 font-semibold">Raih Host</span> and welcome travelers with open arms 🤝🏡
  </p>
</div>

      {/* RIGHT */}
      <div className="flex w-full md:w-2/3 h-full bg-white   md:px-20 ">
        <div className="w-full h-full flex flex-col items-center    sm:px-0 lg:px-8">
          <div className="block mb-10 md:hidden -ml-8">
            <Logo />
          </div>

          <div className=" w-full md:w-[80%] lg:w-[90%] xl:w-[95%]  flex flex-col">
            <form className=" w-full  space-y-6">
              <div className="flex flex-col rounded-md shadow-sm -space-y-px border border-black  mt-5">
                <h1 className="ml-5 pb-4">
                  {" "}
                  Enter your addre where you will ne hoting
                </h1>
                <span className="ml-5 mb-2" >
                  your addres (including streeet/house/building number)
                </span>{" "}
                <PlacesAutocompleteForHost onSelectAddress={handleAddressSelect} />
                <Divider />

                <div className="flex w-full justify-between py-3 px-4 ">
                  <button className="px-4  rounded bg-slate-400" onClick={() => dispatch(prevStep())}>Back</button>
                  <button className="px-4  rounded bg-slate-400" onClick={() => dispatch(nextStep())}>
                    Contine
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Toaster richColors />
    </div>
  );
};

export default Address;
