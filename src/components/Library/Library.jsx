const Library = () => {
  return (
    <div className="p-4 text-gray-200">
      <h2 className="font-bold ">Your Library</h2>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gray-800"></div>
          <span>My recommendation playlist</span>
        </div>
        {/* Add more playlist items as needed */}
      </div>
    </div>
  );
};

export default Library;