const PhotosSection = ({ images }: { images: Image[] }) => {
    return (
      <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto p-4">
        {images?.map((image) => (
          <div key={image._id} className="bg-white p-2 rounded-lg shadow-md">
            <img
              src={image.url}
              alt={image.description}
              className="w-full h-40 object-cover rounded-lg"
            />
            <p className="text-center text-gray-700 mt-2">{image.description}</p>
          </div>
        ))}
      </div>
    );
  };

  export default PhotosSection
