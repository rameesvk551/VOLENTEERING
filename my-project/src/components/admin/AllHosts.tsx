import { Button } from '@mui/material'; // For buttons and core components
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { RxCross1 } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import { Link } from "react-router-dom";
import { AppDispatch } from '../../redux/store';
import { getAllHosts } from '../../redux/adminSlice';







const AllHosts = () => {
  const dispatch=useDispatch<AppDispatch>()
  useEffect(()=>{

    dispatch(getAllHosts())
  }[dispatch])
  type rowType = {
    _id: string;
    name: string;
    country: string;
    age: number;
    status: string;
  };
const [volenteers, setVolenteers] = useState<rowType[]>([]);
const  [open,setOpen]=useState<boolean>(false)
const columns: GridColDef<rowType>[] = [
  { field: "_id", headerName: "ID", minWidth: 150, flex: 0.7 },
  { field: "name", headerName: "Name", minWidth: 130, flex: 0.7 },
  { field: "email", headerName: "Email", minWidth: 130, flex: 0.7 },
  { field: "age", headerName: "Age", type: "number", minWidth: 80, flex: 0.5 },
  { field: "status", headerName: "Status", minWidth: 130, flex: 0.7 }
];

  const row: rowType[] = [];


  volenteers &&
  volenteers.forEach((vol:rowType) => {
      row.push({
        _id: vol._id,
        name: vol.name,
        country: vol.country,
        status: vol.status,
        age: vol.age,
      });
    });

  return (
    <div className="w-full flex justify-center  top-0 mt-0 pt-10">
  <div className="w-[97%] ">
  <div className="sm:hidden md:flex flex-row w-full h-[30vh] md:h-[30vh] gap-4 p-4">
  <div className="flex-1 bg-red-500 flex items-center justify-center text-white text-2xl font-bold rounded-lg shadow">
    <h1>Today joined Hosts</h1>
  </div>
  <div className="flex-1 bg-blue-500 flex items-center justify-center text-white text-2xl font-bold rounded-lg shadow">
    <h1>tottal volenteers</h1>
  </div>
  <div className="flex-1 bg-green-500 flex items-center justify-center text-white text-2xl font-bold rounded-lg shadow">
    <h1>performing volenteers</h1>
  </div>
</div>

    <h3 className="text-[22px] font-Poppins pb-2 text-center">All Hosts</h3>
    <div className="w-full min-h-[45vh] bg-white rounded">
      <DataGrid
        rows={row}
        columns={columns}
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
        autoHeight
      />
    </div>

    {open && (
      <div className="fixed inset-0 z-[999] bg-[#00000039] flex items-center justify-center">
        <div className="w-[95%] 800px:w-[40%] min-h-[20vh] bg-white rounded shadow p-5">
          <div className="w-full flex justify-end cursor-pointer">
            <RxCross1 size={25} onClick={() => setOpen(false)} />
          </div>
          <h3 className="text-[25px] text-center py-5 font-Poppins text-[#000000cb]">
            Are you sure you wanna delete this user?
          </h3>
          <div className="w-full flex items-center justify-center">
            <div
              className="w-[150px] bg-black h-[50px] flex items-center justify-center rounded-xl cursor-pointer text-white text-[18px] mr-4"
              onClick={() => setOpen(false)}
            >
              Cancel
            </div>
            <div
              className="w-[150px] bg-black h-[50px] flex items-center justify-center rounded-xl cursor-pointer text-white text-[18px] ml-4"
              onClick={() => setOpen(false)}
            >
              Confirm
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>

  );
};

export default AllHosts;
