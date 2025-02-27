import { MdCastForEducation, MdOutlineSportsHandball } from "react-icons/md";
import { BsCodeSlash, BsNewspaper } from "react-icons/bs";
import { GiClothes } from "react-icons/gi";

interface User {
  _id: string;
  name: string;
  image: string;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  desc: string;
  img: string;
  cat: string;
  views: string[];
  user: User;
  comments: string[];
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
export const CATEGORIES = [
  {
    label: "NEWS",
    color: "bg-[#e11d48]",
    text: "text-[#fff]",

  },
  {
    label: "SPORTS",
    color: "bg-[#2563eb]",
  
  },
  {
    label: "CODING",
    color: "bg-[#000000]",
   
  },
  {
    label: "EDUCATION",
    color: "bg-[#ca8a04]",
  
  },
  {
    label: "FASHION",
    color: "bg-[#9333ea]",
 
  },
];

export const posts: Post[] = [
  {
    _id: "655b3f037a397a2c8546c2f5",
    title: "markdown-to-jsx v6 is now available",
    slug: "markdown-to-jsx-v6-is-now-available",
    desc: `<p>If you haven’t used <code>markdown-to-jsx</code> in the past, now is a great time!...`,
    img: "https://firebasestorage.googleapis.com/v0/b/codewave-codebase-e052b.appspot.com/o/nextjs-blog%2FSignin%20-%20Dark.png?alt=media&token=b3abdef1-5c0c-404c-a81b-94d558a6bb76",
    cat: "CODING",
    views: [
      "655ca253c2b11c0988aa3127",
      "655ca254c2b11c0988aa312c",
      "655ca25dc2b11c0988aa3131",
      "655ca25ec2b11c0988aa3136",
    ],
    user: {
      _id: "655ad72bd148ee58ab8d5871",
      name: "Akwasi Asante",
      image:
        "https://firebasestorage.googleapis.com/v0/b/blogwave-4bb76.appspot.com/o/1700452069593FB_IMG_1608124167539-removebg%20(1).png?alt=media&token=c2270464-bc4f-4ec3-8ea7-39ca905621b5",
    },
    comments: ["655ca6965d5a025fa52b60c6", "655ce52bde4a69fbc727abac"],
    status: true,
    createdAt: "2023-11-20T11:12:03.368Z",
    updatedAt: "2023-11-23T06:48:16.785Z",
    __v: 0,
  },
  {
    _id: "655b21192255c0b35d4ab60b",
    title: "Fullstack Social Media App - Frontend",
    slug: "fullstack-social-media-app-frontend",
    desc: `<p>Hello coders, welcome to another episode of React project...`,
    img: "https://example.com/image.png",
    cat: "CODING",
    views: ["655ef5b0c86d7a706c36f9cb"],
    user: {
      _id: "655ad72bd148ee58ab8d5871",
      name: "Akwasi Asante",
      image: "https://example.com/user.png",
    },
    comments: ["655ca6965d5a025fa52b60c6"],
    status: true,
    createdAt: "2023-11-21T11:12:03.368Z",
    updatedAt: "2023-11-22T06:48:16.785Z",
    __v: 0,
  },
];
