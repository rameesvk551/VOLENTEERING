import React from 'react'

const Review = () => {
  return (
    <div>
      <div className='flex flex-row'>
      <div className="w-1/6 flex flex-col items-center">
  <img src="/host.jpg" alt="Host Profile" className="rounded-full w-24 h-24" />
  
  {/* Star Rating */}
  <div className="flex mt-2 text-yellow-500">
    {[...Array(5)].map((_, index) => (
      <svg
        key={index}
        className="w-5 h-5 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ))}
  </div>
</div>

        <div className='w-5/6 border border-black '>
        <div className='flex justify-between'>
        <span className="text-sm">Left by Volunteer (Ramees) for host</span>

        <span>22-10-2023</span>
        </div>
        <p>ndustry. Lorem Ipsum has been the industry's standard dummy text ever s
            ince the 1500s, when an unknown printer took a galley of type and scrambled it to make
             a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, 
             remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently
             with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum</p>
        
        </div>
 

      </div>
    </div>
  )
}

export default Review