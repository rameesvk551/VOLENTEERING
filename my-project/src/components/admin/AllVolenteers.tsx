import { Button } from '@mui/material';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { RxCross1 } from 'react-icons/rx';
import { MdBlock, MdEdit } from "react-icons/md";
import { Link } from "react-router-dom";
import { RootState, AppDispatch } from "../../redux/store";
import { useSelector, useDispatch } from "react-redux";
import { getAllUsers } from '../../redux/adminSlice';

type RowType = {
  id:string,
  name: string;
  email: string;
  country: string;
  age: number;
  status: string;
};

const AllVolenteers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { volunteers, loading, error } = useSelector((state: RootState) => state.admin);


  useEffect(() => {
    console.log("Dispatching getAllUsers...");
    dispatch(getAllUsers());
  }, [dispatch]);

  const [open, setOpen] = useState<boolean>(false);


  
  const columns: GridColDef<RowType>[] = [
    { field: "id", headerName: "ID", minWidth: 150, flex: 0.7 },
    { field: "name", headerName: "Name", minWidth: 130, flex: 0.7 },
    { field: "email", headerName: "Email", minWidth: 130, flex: 0.7 },
    { field: "age", headerName: "Age", type: "number", minWidth: 80, flex: 0.5 },
    { field: "status", headerName: "Status", minWidth: 130, flex: 0.7 },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 180,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <div className="flex gap-2">
          {/* Edit Button */}
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<MdEdit />}
          >
            Edit
          </Button>
  
          {/* Block Button */}
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<MdBlock />}
            
          >
            Block
          </Button>
        </div>
      ),
    },
  ];
  
  
  

  const rows: RowType[] = volunteers?.map((vol) => ({
    id: vol._id,
    name: vol.firstName,
    email: vol.email,
    country: vol.country || "N/A",
    age: vol.age || 0,
    status: vol.status || "Unknown",
  })) || [];

  return (
    <>
      {loading ? (
        <div className="w-full flex justify-center items-center min-h-screen">
          <div>Loading...</div>
        </div>
      ) : (
        <div className="w-full flex justify-center top-0 mt-0 pt-10">
          <div className="w-[97%]">
            <div className="sm:hidden md:flex flex-row w-full h-[30vh] md:h-[30vh] gap-4 p-4">
              <div className="flex-1 bg-red-500 flex items-center justify-center text-white text-2xl font-bold rounded-lg shadow">
                <h1>Today joined volunteers</h1>
              </div>
              <div className="flex-1 bg-blue-500 flex items-center justify-center text-white text-2xl font-bold rounded-lg shadow">
                <h1>Total volunteers</h1>
              </div>
              <div className="flex-1 bg-green-500 flex items-center justify-center text-white text-2xl font-bold rounded-lg shadow">
                <h1>Performing volunteers</h1>
              </div>
            </div>
  
            <h3 className="text-[22px] font-Poppins pb-2 text-center">All Volunteers</h3>
            <div className="w-full min-h-[45vh] bg-white rounded">
              <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[10]}
                disableRowSelectionOnClick
                autoHeight
                loading={loading}
              />
            </div>
  
            {open && (
              <div className="fixed inset-0 z-[999] bg-[#00000039] flex items-center justify-center">
                <div className="w-[95%] 800px:w-[40%] min-h-[20vh] bg-white rounded shadow p-5">
                  <div className="w-full flex justify-end cursor-pointer">
                    <RxCross1 size={25} onClick={() => setOpen(false)} />
                  </div>
                  <h3 className="text-[25px] text-center py-5 font-Poppins text-[#000000cb]">
                    Are you sure you want to delete this user?
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
      )}
    </>
  );
  
};

export default AllVolenteers;
