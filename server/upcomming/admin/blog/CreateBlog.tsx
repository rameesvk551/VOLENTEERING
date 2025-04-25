import React from "react";

import { Container } from "@mui/material";
import BlogForm from "../../../components/admin/blog/BlogForm";
import DashboardHeader from "../../../components/admin/Layout/DashbordHeader"
import DashboardSideBar from "../../../components/admin/Layout/DashbordSideBar"
const CreateBlog: React.FC = () => {
  return (
    <div>
        <DashboardHeader/>
        <div className="flex items-center justify-between w-full"> 
     <div className="w-[330px]">
      <DashboardSideBar active={4}/>
     </div>
     <BlogForm/>
    </div>
    </div>
  );
};

export default CreateBlog;
